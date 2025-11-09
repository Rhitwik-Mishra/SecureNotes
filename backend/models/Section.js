import mongoose from 'mongoose';

const SectionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // A, B, C, etc.
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  semester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
}, { timestamps: true });

SectionSchema.index({ name: 1, branch_id: 1, semester_id: 1 }, { unique: true });

export default mongoose.model('Section', SectionSchema);

