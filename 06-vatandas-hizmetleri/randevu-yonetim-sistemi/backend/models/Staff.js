const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  position: {
    type: String,
    required: true
  },
  specializations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  workingHours: {
    monday: { start: String, end: String, isAvailable: Boolean },
    tuesday: { start: String, end: String, isAvailable: Boolean },
    wednesday: { start: String, end: String, isAvailable: Boolean },
    thursday: { start: String, end: String, isAvailable: Boolean },
    friday: { start: String, end: String, isAvailable: Boolean },
    saturday: { start: String, end: String, isAvailable: Boolean },
    sunday: { start: String, end: String, isAvailable: Boolean }
  },
  breaks: [{
    day: String,
    start: String,
    end: String
  }],
  maxDailyAppointments: {
    type: Number,
    default: 20
  },
  averageServiceTime: {
    type: Number,
    default: 30 // minutes
  },
  leaves: [{
    startDate: Date,
    endDate: Date,
    reason: String,
    approved: Boolean
  }],
  performance: {
    totalAppointments: {
      type: Number,
      default: 0
    },
    completedAppointments: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Staff', staffSchema);