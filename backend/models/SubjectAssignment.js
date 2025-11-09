import mongoose from 'mongoose';

const SubjectAssignmentSchema = new mongoose.Schema({
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
}, { timestamps: true });

SubjectAssignmentSchema.index({ teacher_id: 1, subject_id: 1 }, { unique: true });

export default mongoose.model('SubjectAssignment', SubjectAssignmentSchema);

