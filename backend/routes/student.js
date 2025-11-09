import express from 'express';
import fs from 'fs';
import mime from 'mime-types';
import Note from '../models/Note.js';
import Module from '../models/Module.js';
import Subject from '../models/Subject.js';
import Progress from '../models/Progress.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(requireAuth, requireRole('student'));

// Get student's subjects (based on B-S-S)
router.get('/subjects', async (req, res) => {
  try {
    const student = await User.findById(req.user.id).populate('branch_id semester_id section_id');
    if (!student.branch_id || !student.semester_id) {
      return res.json([]); // Student not assigned to B-S
    }
    const subjects = await Subject.find({
      branch_id: student.branch_id._id,
      semester_id: student.semester_id._id
    }).populate('branch_id', 'name code').populate('semester_id', 'number').sort({ code: 1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get modules/folders for a subject
router.get('/subjects/:subject_id/modules', async (req, res) => {
  try {
    const { subject_id } = req.params;
    const student = await User.findById(req.user.id);
    
    // Verify student has access to this subject (same B-S)
    const subject = await Subject.findById(subject_id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    if (subject.branch_id.toString() !== student.branch_id?.toString() || 
        subject.semester_id.toString() !== student.semester_id?.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const modules = await Module.find({ subject_id })
      .populate('subject_id', 'name code')
      .populate('created_by', 'name email')
      .sort({ order: 1, createdAt: 1 });
    res.json(modules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get notes for a module
router.get('/modules/:module_id/notes', async (req, res) => {
  try {
    const { module_id } = req.params;
    const student = await User.findById(req.user.id);
    
    // Verify module belongs to student's subject
    const module = await Module.findById(module_id).populate('subject_id');
    if (!module) return res.status(404).json({ error: 'Module not found' });
    const subject = await Subject.findById(module.subject_id._id);
    if (subject.branch_id.toString() !== student.branch_id?.toString() || 
        subject.semester_id.toString() !== student.semester_id?.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const notes = await Note.find({ module_id })
      .populate('teacher_id', 'name email')
      .populate('module_id', 'title')
      .sort({ order: 1, uploaded_at: -1 });
    
    // Get progress for each note
    const noteIds = notes.map(n => n._id);
    const progressMap = {};
    const progresses = await Progress.find({ student_id: req.user.id, note_id: { $in: noteIds } });
    progresses.forEach(p => {
      progressMap[p.note_id.toString()] = p;
    });
    
    const notesWithProgress = notes.map(note => ({
      ...note.toObject(),
      progress: progressMap[note._id.toString()] || null
    }));
    
    res.json(notesWithProgress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Secure view endpoint – stream without exposing direct path
router.get('/notes/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findById(req.user.id);
    
    const note = await Note.findById(id).populate('module_id');
    if (!note) return res.status(404).json({ error: 'Not found' });
    
    // Verify access: module's subject matches student's B-S
    const module = await Module.findById(note.module_id._id).populate('subject_id');
    const subject = await Subject.findById(module.subject_id._id);
    if (subject.branch_id.toString() !== student.branch_id?.toString() || 
        subject.semester_id.toString() !== student.semester_id?.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Record view
    await Progress.findOneAndUpdate(
      { student_id: req.user.id, note_id: id },
      { student_id: req.user.id, note_id: id, viewed_at: new Date() },
      { upsert: true, new: true }
    );
    
    const filePath = note.file_path;
    if (!filePath || !fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    
    res.setHeader('Content-Type', mime.lookup('pdf') || 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="note.pdf"');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => res.status(500).end());
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark note as complete
router.post('/notes/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    
    // Verify access
    const module = await Module.findById(note.module_id).populate('subject_id');
    const subject = await Subject.findById(module.subject_id._id);
    const student = await User.findById(req.user.id);
    if (subject.branch_id.toString() !== student.branch_id?.toString() || 
        subject.semester_id.toString() !== student.semester_id?.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const progress = await Progress.findOneAndUpdate(
      { student_id: req.user.id, note_id: id },
      { 
        student_id: req.user.id, 
        note_id: id, 
        completed: completed !== false,
        completed_at: completed !== false ? new Date() : null
      },
      { upsert: true, new: true }
    );
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get progress summary
router.get('/progress', async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    const subjects = await Subject.find({
      branch_id: student.branch_id,
      semester_id: student.semester_id
    });
    const subjectIds = subjects.map(s => s._id);
    const modules = await Module.find({ subject_id: { $in: subjectIds } });
    const moduleIds = modules.map(m => m._id);
    const notes = await Note.find({ module_id: { $in: moduleIds } });
    const noteIds = notes.map(n => n._id);
    
    const progresses = await Progress.find({ student_id: req.user.id, note_id: { $in: noteIds } });
    const completed = progresses.filter(p => p.completed).length;
    const total = noteIds.length;
    
    res.json({ completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recently viewed notes
router.get('/notes/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '10', 10);
    const progresses = await Progress.find({ student_id: req.user.id })
      .populate('note_id')
      .sort({ viewed_at: -1 })
      .limit(limit);
    
    const notes = progresses
      .map(p => p.note_id)
      .filter(Boolean)
      .slice(0, limit);
    
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ subjects: [], modules: [], notes: [] });
    
    const student = await User.findById(req.user.id);
    const subjects = await Subject.find({
      branch_id: student.branch_id,
      semester_id: student.semester_id,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } }
      ]
    });
    const subjectIds = subjects.map(s => s._id);
    
    const modules = await Module.find({
      subject_id: { $in: subjectIds },
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    }).populate('subject_id', 'name code');
    
    const moduleIds = modules.map(m => m._id);
    const notes = await Note.find({
      module_id: { $in: moduleIds },
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    }).populate('module_id', 'title').populate('teacher_id', 'name email');
    
    res.json({ subjects, modules, notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
