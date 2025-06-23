const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
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
  workingHours: {
    monday: { start: String, end: String, isOpen: Boolean },
    tuesday: { start: String, end: String, isOpen: Boolean },
    wednesday: { start: String, end: String, isOpen: Boolean },
    thursday: { start: String, end: String, isOpen: Boolean },
    friday: { start: String, end: String, isOpen: Boolean },
    saturday: { start: String, end: String, isOpen: Boolean },
    sunday: { start: String, end: String, isOpen: Boolean }
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  staff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }],
  location: {
    building: String,
    floor: String,
    room: String
  },
  contactInfo: {
    phone: String,
    email: String,
    extension: String
  },
  appointmentDuration: {
    type: Number,
    default: 30 // minutes
  },
  maxDailyAppointments: {
    type: Number,
    default: 50
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

module.exports = mongoose.model('Department', departmentSchema);