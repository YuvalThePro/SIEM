const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
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
  level: {
    type: String,
    enum: ['info', 'warn', 'error', 'critical'],
    default: 'info'
  },
  eventType: {
    type: String,
    required: true,
    index: true
  },
  source: {
    type: String,
    required: true,
    index: true
  },
  ip: {
    type: String,
    trim: true
  },
  user: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  raw: {
    type: mongoose.Schema.Types.Mixed
  }
});


logSchema.index({ tenantId: 1, ts: -1 });
logSchema.index({ tenantId: 1, eventType: 1 });
logSchema.index({ tenantId: 1, source: 1 });
logSchema.index({ tenantId: 1, ip: 1, ts: -1 });
logSchema.index({ tenantId: 1, user: 1, ts: -1 });

module.exports = mongoose.model('Log', logSchema);
