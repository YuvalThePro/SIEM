const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'analyst', 'viewer'],
    default: 'viewer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.index({ tenantId: 1, email: 1 });

module.exports = mongoose.model('User', userSchema);
