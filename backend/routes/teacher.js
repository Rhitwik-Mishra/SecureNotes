import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Note from '../models/Note.js';
import Module from '../models/Module.js';
import SubjectAssignment from '../models/SubjectAssignment.js';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const maxMb = parseInt(process.env.MAX_UPLOAD_MB || '20', 10);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  }
});

function pdfFileFilter(_req, file, cb) {
  if (file.mimetype !== 'application/pdf') return cb(new Error('PDF only'));
  cb(null, true);
}

const upload = multer({ storage, fileFilter: pdfFileFilter, limits: { fileSize: maxMb * 1024 * 1024 } });
const uploadLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 }); // 10 uploads per minute

router.use(requireAuth, requireRole('teacher'));

// Get assigned subjects
router.get('/subjects', async (req, res) => {
  try {
    const assignments = await SubjectAssignment.find({ teacher_id: req.user.id })
      .populate('subject_id');
    const subjects = assignments.map(a => a.subject_id).filter(Boolean);
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get students under teacher's B-S-S
router.get('/students', async (req, res) => {
  try {
    const teacher = await User.findById(req.user.id).populate('branch_id semester_id section_id');
    if (!teacher.branch_id || !teacher.semester_id || !teacher.section_id) {
      return res.json([]); // Teacher not assigned to B-S-S
    }
    const students = await User.find({
      role: 'student',
      branch_id: teacher.branch_id._id,
      semester_id: teacher.semester_id._id,
      section_id: teacher.section_id._id
    }, '-password')
      .populate('branch_id', 'name code')
      .populate('semester_id', 'number')
      .populate('section_id', 'name')
      .sort({ name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Module/Folder CRUD
router.get('/modules', async (req, res) => {
  try {
    const { subject_id, parent_id } = req.query;
    const filter = {};
    if (subject_id) filter.subject_id = subject_id;
    if (parent_id !== undefined) {
      filter.parent_id = parent_id || null;
    }
    // Only show modules created by this teacher or in their assigned subjects
    const assignments = await SubjectAssignment.find({ teacher_id: req.user.id });
    const subjectIds = assignments.map(a => a.subject_id.toString());
    if (subject_id && !subjectIds.includes(subject_id)) {
      return res.status(403).json({ error: 'Not assigned to this subject' });
    }
    const modules = await Module.find(filter)
      .populate('subject_id', 'name code')
      .populate('created_by', 'name email')
      .sort({ order: 1, createdAt: 1 });
    res.json(modules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/modules', async (req, res) => {
  try {
    const { subject_id, title, description, parent_id, order } = req.body;
    if (!subject_id || !title) return res.status(400).json({ error: 'subject_id and title required' });
    
    // Verify teacher is assigned to this subject
    const assignment = await SubjectAssignment.findOne({ teacher_id: req.user.id, subject_id });
    if (!assignment) return res.status(403).json({ error: 'Not assigned to this subject' });
    
    const module = await Module.create({
      subject_id,
      title,
      description: description || '',
      parent_id: parent_id || null,
      order: order || 0,
      created_by: req.user.id
    });
    await module.populate('subject_id', 'name code');
    res.json(module);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/modules/:id', async (req, res) => {
  try {
    const { title, description, order } = req.body;
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ error: 'Module not found' });
    if (module.created_by.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (title) module.title = title;
    if (description !== undefined) module.description = description;
    if (order !== undefined) module.order = order;
    await module.save();
    await module.populate('subject_id', 'name code');
    res.json(module);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/modules/:id', async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ error: 'Module not found' });
    if (module.created_by.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    // Check for child modules
    const children = await Module.countDocuments({ parent_id: module._id });
    if (children > 0) return res.status(400).json({ error: 'Cannot delete module with sub-modules' });
    // Check for notes
    const notes = await Note.countDocuments({ module_id: module._id });
    if (notes > 0) return res.status(400).json({ error: 'Cannot delete module with notes' });
    await Module.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Notes CRUD
router.post('/notes', uploadLimiter, upload.single('file'), async (req, res) => {
  try {
    const { title, module_id, description, order } = req.body;
    if (!req.file) return res.status(400).json({ error: 'File required (PDF)' });
    if (!title || !module_id) return res.status(400).json({ error: 'title and module_id required' });
    
    // Verify module belongs to teacher's assigned subject
    const module = await Module.findById(module_id).populate('subject_id');
    if (!module) return res.status(404).json({ error: 'Module not found' });
    const assignment = await SubjectAssignment.findOne({ 
      teacher_id: req.user.id, 
      subject_id: module.subject_id._id 
    });
    if (!assignment) return res.status(403).json({ error: 'Not assigned to this subject' });
    
    const note = await Note.create({
      teacher_id: req.user.id,
      module_id,
      title,
      description: description || '',
      file_path: req.file.path,
      file_size: req.file.size,
      order: order || 0,
    });
    await note.populate('module_id', 'title');
    res.json(note);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Upload failed' });
  }
});

router.get('/notes', async (req, res) => {
  try {
    const { module_id, subject_id, q } = req.query;
    const filter = { teacher_id: req.user.id };
    if (module_id) filter.module_id = module_id;
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    let notes = await Note.find(filter)
      .populate({
        path: 'module_id',
        select: 'title subject_id',
        populate: {
          path: 'subject_id',
          select: 'name code branch_id semester_id',
          populate: [
            { path: 'branch_id', select: 'name code' },
            { path: 'semester_id', select: 'number' }
          ]
        }
      })
      .sort({ order: 1, uploaded_at: -1 });
    
    // Filter by subject if specified
    if (subject_id) {
      notes = notes.filter(n => n.module_id?.subject_id?._id?.toString() === subject_id || n.module_id?.subject_id?.toString() === subject_id);
    }
    
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/notes/:id', async (req, res) => {
  try {
    const { title, description, order } = req.body;
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    if (note.teacher_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (title) note.title = title;
    if (description !== undefined) note.description = description;
    if (order !== undefined) note.order = order;
    await note.save();
    await note.populate('module_id', 'title');
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/notes/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, teacher_id: req.user.id });
    if (!note) return res.status(404).json({ error: 'Not found' });
    try {
      if (note.file_path && fs.existsSync(note.file_path)) fs.unlinkSync(note.file_path);
    } catch {}
    await Note.deleteOne({ _id: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ subjects: [], modules: [], notes: [] });
    
    const assignments = await SubjectAssignment.find({ teacher_id: req.user.id });
    const subjectIds = assignments.map(a => a.subject_id.toString());
    
    const [subjects, modules, notes] = await Promise.all([
      Subject.find({ _id: { $in: subjectIds }, $or: [
        { name: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } }
      ]}),
      Module.find({ subject_id: { $in: subjectIds }, $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]}).populate('subject_id', 'name code'),
      Note.find({ teacher_id: req.user.id, $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]}).populate('module_id', 'title')
    ]);
    
    res.json({ subjects, modules, notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
