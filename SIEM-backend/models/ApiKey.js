const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  keyHash: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date
  }
});


apiKeySchema.index({ tenantId: 1, name: 1 });

module.exports = mongoose.model('ApiKey', apiKeySchema);
