import mongoose from 'mongoose';

const BranchSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true, uppercase: true }, // CSE, ISE, ECE, etc.
}, { timestamps: true });

export default mongoose.model('Branch', BranchSchema);

