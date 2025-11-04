import express from 'express';
import User from '../models/User.js';
import Assignment from '../models/Assignment.js';
import Note from '../models/Note.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

// Stats
router.get('/stats', async (_req, res) => {
  const [teachers, students, notes] = await Promise.all([
    User.countDocuments({ role: 'teacher' }),
    User.countDocuments({ role: 'student' }),
    Note.countDocuments(),
  ]);
  res.json({ teachers, students, notes });
});

// Users CRUD (simple)
router.get('/users', async (_req, res) => {
  const users = await User.find({}, '-password').sort({ created_at: -1 }).limit(500);
  res.json(users);
});

router.post('/users', async (req, res) => {
  // Admin should use /api/auth/register for hashed password creation in this MVP
  return res.status(405).json({ error: 'Use /api/auth/register' });
});

router.delete('/users/:id', async (req, res) => {
  const id = req.params.id;
  await Assignment.deleteMany({ $or: [{ student_id: id }, { teacher_id: id }] });
  await User.deleteOne({ _id: id });
  res.json({ ok: true });
});

// Assignments
router.post('/assign', async (req, res) => {
  const { studentId, teacherId } = req.body;
  if (!studentId || !teacherId) return res.status(400).json({ error: 'Missing fields' });
  const student = await User.findOne({ _id: studentId, role: 'student' });
  const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
  if (!student || !teacher) return res.status(404).json({ error: 'Not found' });
  await Assignment.updateOne({ student_id: studentId, teacher_id: teacherId }, { $setOnInsert: { student_id: studentId, teacher_id: teacherId } }, { upsert: true });
  res.json({ ok: true });
});

router.post('/assign/batch', async (req, res) => {
  const { studentIds, teacherId } = req.body;
  if (!Array.isArray(studentIds) || !teacherId) return res.status(400).json({ error: 'Invalid payload' });
  const ops = studentIds.map((sid) => ({ updateOne: { filter: { student_id: sid, teacher_id: teacherId }, update: { $setOnInsert: { student_id: sid, teacher_id: teacherId } }, upsert: true } }));
  if (ops.length) await Assignment.bulkWrite(ops);
  res.json({ ok: true, count: ops.length });
});

export default router;



