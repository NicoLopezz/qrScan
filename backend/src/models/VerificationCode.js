import mongoose from 'mongoose';

const verificationCodeSchema = new mongoose.Schema({
  email:     { type: String, required: true, unique: true },
  code:      { type: String, required: true },
  verified:  { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // TTL: 10 minutes
});

export default mongoose.model('VerificationCode', verificationCodeSchema);
