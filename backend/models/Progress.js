import mongoose from 'mongoose';

const ProgressSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  note_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
  completed: { type: Boolean, default: false },
  viewed_at: { type: Date, default: Date.now },
  completed_at: { type: Date, default: null },
}, { timestamps: true });

ProgressSchema.index({ student_id: 1, note_id: 1 }, { unique: true });

export default mongoose.model('Progress', ProgressSchema);

