import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, default: '' },
  file_path: { type: String, required: true },
}, { timestamps: { createdAt: 'uploaded_at', updatedAt: 'updated_at' } });

export default mongoose.model('Note', NoteSchema);



