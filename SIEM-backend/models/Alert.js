import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  ts: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  ruleName: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
    index: true
  },
  entities: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  dedupeKey: {
    type: String,
    sparse: true,
    index: true
  },
  matchedLogIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Log'
  }],
  closedAt: {
    type: Date
  },
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });


alertSchema.index({ tenantId: 1, ts: -1 });
alertSchema.index({ tenantId: 1, status: 1, ts: -1 });
alertSchema.index({ tenantId: 1, dedupeKey: 1 }, { unique: true, partialFilterExpression: { dedupeKey: { $exists: true } } });

export default mongoose.model('Alert', alertSchema);
