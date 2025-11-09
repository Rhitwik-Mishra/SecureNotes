import express from 'express';
import Branch from '../models/Branch.js';
import Semester from '../models/Semester.js';
import Section from '../models/Section.js';
import Subject from '../models/Subject.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

// All routes require admin
router.use(requireAuth, requireRole('admin'));

// ========== BRANCHES ==========
router.get('/branches', async (_req, res) => {
  try {
    const branches = await Branch.find().sort({ name: 1 });
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/branches', async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ error: 'Name and code required' });
    const branch = await Branch.create({ name, code: code.toUpperCase() });
    res.json(branch);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Branch already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/branches/:id', async (req, res) => {
  try {
    const { name, code } = req.body;
    const branch = await Branch.findByIdAndUpdate(req.params.id, { name, code: code?.toUpperCase() }, { new: true });
    if (!branch) return res.status(404).json({ error: 'Branch not found' });
    res.json(branch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/branches/:id', async (req, res) => {
  try {
    await Branch.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== SEMESTERS ==========
router.get('/semesters', async (_req, res) => {
  try {
    const semesters = await Semester.find().sort({ number: 1 });
    res.json(semesters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/semesters', async (req, res) => {
  try {
    const { number } = req.body;
    if (!number || number < 1 || number > 8) return res.status(400).json({ error: 'Valid semester number (1-8) required' });
    const semester = await Semester.create({ number });
    res.json(semester);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Semester already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/semesters/:id', async (req, res) => {
  try {
    await Semester.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== SECTIONS ==========
router.get('/sections', async (req, res) => {
  try {
    const { branch_id, semester_id } = req.query;
    const filter = {};
    if (branch_id) filter.branch_id = branch_id;
    if (semester_id) filter.semester_id = semester_id;
    const sections = await Section.find(filter).populate('branch_id', 'name code').populate('semester_id', 'number').sort({ name: 1 });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sections', async (req, res) => {
  try {
    const { name, branch_id, semester_id } = req.body;
    if (!name || !branch_id || !semester_id) return res.status(400).json({ error: 'Name, branch_id, and semester_id required' });
    const section = await Section.create({ name, branch_id, semester_id });
    await section.populate('branch_id', 'name code');
    await section.populate('semester_id', 'number');
    res.json(section);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Section already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/sections/:id', async (req, res) => {
  try {
    await Section.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== SUBJECTS ==========
router.get('/subjects', async (req, res) => {
  try {
    const { branch_id, semester_id } = req.query;
    const filter = {};
    if (branch_id) filter.branch_id = branch_id;
    if (semester_id) filter.semester_id = semester_id;
    const subjects = await Subject.find(filter).populate('branch_id', 'name code').populate('semester_id', 'number').sort({ code: 1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/subjects', async (req, res) => {
  try {
    const { name, code, branch_id, semester_id, description } = req.body;
    if (!name || !code || !branch_id || !semester_id) return res.status(400).json({ error: 'Name, code, branch_id, and semester_id required' });
    const subject = await Subject.create({ name, code, branch_id, semester_id, description: description || '' });
    await subject.populate('branch_id', 'name code');
    await subject.populate('semester_id', 'number');
    res.json(subject);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Subject already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/subjects/:id', async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const subject = await Subject.findByIdAndUpdate(req.params.id, { name, code, description }, { new: true });
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    await subject.populate('branch_id', 'name code');
    await subject.populate('semester_id', 'number');
    res.json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/subjects/:id', async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

