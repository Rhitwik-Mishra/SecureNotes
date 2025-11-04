import mongoose from 'mongoose';

const AssignmentSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

AssignmentSchema.index({ student_id: 1, teacher_id: 1 }, { unique: true });

export default mongoose.model('Assignment', AssignmentSchema);



