import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  name: { type: String, required: true },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
  semester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', default: null },
  section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('User', UserSchema);


