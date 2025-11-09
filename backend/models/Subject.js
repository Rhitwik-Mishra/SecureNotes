import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true }, // Subject code like CS301, etc.
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  semester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  description: { type: String, default: '' },
}, { timestamps: true });

SubjectSchema.index({ code: 1, branch_id: 1, semester_id: 1 }, { unique: true });

export default mongoose.model('Subject', SubjectSchema);

