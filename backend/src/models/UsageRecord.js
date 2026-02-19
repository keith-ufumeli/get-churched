import mongoose from 'mongoose';

const UsageRecordSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    calls: { type: Number, default: 0 },
    tokens: { type: Number, default: 0 },
    failures: { type: Number, default: 0 },
    fallbacks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UsageRecordSchema.index({ createdAt: -1 });

export default mongoose.model('UsageRecord', UsageRecordSchema);
