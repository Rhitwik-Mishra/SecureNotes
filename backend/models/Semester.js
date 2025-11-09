import mongoose from 'mongoose';

const SemesterSchema = new mongoose.Schema({
  number: { type: Number, required: true, min: 1, max: 8 },
}, { timestamps: true });

SemesterSchema.index({ number: 1 }, { unique: true });

export default mongoose.model('Semester', SemesterSchema);

