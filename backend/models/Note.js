import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  file_path: { type: String, required: true },
  file_size: { type: Number, default: 0 }, // in bytes
  order: { type: Number, default: 0 }, // For ordering notes within module
}, { timestamps: { createdAt: 'uploaded_at', updatedAt: 'updated_at' } });

export default mongoose.model('Note', NoteSchema);



