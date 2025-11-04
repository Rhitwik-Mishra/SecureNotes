import express from 'express';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import Note from '../models/Note.js';
import Assignment from '../models/Assignment.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(requireAuth, requireRole('student'));

// List notes from assigned teachers with optional search
router.get('/notes', async (req, res) => {
  const q = (req.query.q || '').toString().trim().toLowerCase();
  const teacherLinks = await Assignment.find({ student_id: req.user.id }).select('teacher_id');
  const teacherIds = teacherLinks.map((t) => t.teacher_id);
  const filter = { teacher_id: { $in: teacherIds } };
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { subject: { $regex: q, $options: 'i' } },
    ];
  }
  const notesDocs = await Note.find(filter).populate('teacher_id', 'name email').sort({ uploaded_at: -1 });
  const notes = notesDocs.map(n => ({
    _id: n._id,
    title: n.title,
    subject: n.subject,
    description: n.description,
    uploaded_at: n.uploaded_at,
    teacher: n.teacher_id ? { id: n.teacher_id._id, name: n.teacher_id.name, email: n.teacher_id.email } : null,
  }));
  res.json(notes);
});

// Secure view endpoint – stream without exposing direct path
router.get('/notes/:id/view', async (req, res) => {
  const id = req.params.id;
  const assignment = await Assignment.findOne({ student_id: req.user.id });
  const note = await Note.findById(id);
  if (!note) return res.status(404).json({ error: 'Not found' });
  // Ensure student is assigned to the teacher who owns this note
  const isAllowed = await Assignment.exists({ student_id: req.user.id, teacher_id: note.teacher_id });
  if (!isAllowed) return res.status(403).json({ error: 'Forbidden' });

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
});

export default router;


