import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Note from '../models/Note.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

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

router.use(requireAuth, requireRole('teacher'));

router.post('/notes', upload.single('file'), async (req, res) => {
  try {
    const { title, subject, description } = req.body;
    if (!req.file) return res.status(400).json({ error: 'File required (PDF)' });
    if (!title || !subject) return res.status(400).json({ error: 'Missing fields' });
    const note = await Note.create({
      teacher_id: req.user.id,
      title,
      subject,
      description: description || '',
      file_path: req.file.path,
    });
    res.json(note);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Upload failed' });
  }
});

router.get('/notes', async (req, res) => {
  const notes = await Note.find({ teacher_id: req.user.id }).sort({ uploaded_at: -1 });
  res.json(notes);
});

router.delete('/notes/:id', async (req, res) => {
  const id = req.params.id;
  const note = await Note.findOne({ _id: id, teacher_id: req.user.id });
  if (!note) return res.status(404).json({ error: 'Not found' });
  try {
    if (note.file_path && fs.existsSync(note.file_path)) fs.unlinkSync(note.file_path);
  } catch {}
  await Note.deleteOne({ _id: id });
  res.json({ ok: true });
});

export default router;



