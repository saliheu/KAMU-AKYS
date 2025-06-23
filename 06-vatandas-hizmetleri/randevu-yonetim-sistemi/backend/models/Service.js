const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 30 // minutes
  },
  requirements: [{
    type: String
  }],
  documents: [{
    name: String,
    description: String,
    isRequired: Boolean
  }],
  fee: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'TRY'
    }
  },
  maxAdvanceBooking: {
    type: Number,
    default: 30 // days
  },
  minAdvanceBooking: {
    type: Number,
    default: 1 // days
  },
  allowOnlineBooking: {
    type: Boolean,
    default: true
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Service', serviceSchema);