import mongoose from 'mongoose';

const ModuleSchema = new mongoose.Schema({
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', default: null }, // For nested folders
  order: { type: Number, default: 0 }, // For ordering modules/folders
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model('Module', ModuleSchema);

