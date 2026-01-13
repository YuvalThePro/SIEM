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
    enum: ['open', 'investigating', 'resolved', 'false-positive'],
    default: 'open',
    index: true
  },
  matchedLogIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Log'
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  },
  resolvedAt: {
    type: Date
  }
}, { timestamps: true });


alertSchema.index({ tenantId: 1, ts: -1 });
alertSchema.index({ tenantId: 1, status: 1 });
alertSchema.index({ tenantId: 1, severity: 1 });

export default mongoose.model('Alert', alertSchema);
