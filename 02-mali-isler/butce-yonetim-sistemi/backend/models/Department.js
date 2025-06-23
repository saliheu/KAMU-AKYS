const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  description: {
    type: String
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  budgetLimit: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp
departmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Get full path (for hierarchical departments)
departmentSchema.methods.getFullPath = async function() {
  let path = [this.name];
  let current = this;
  
  while (current.parent) {
    current = await this.model('Department').findById(current.parent);
    if (current) {
      path.unshift(current.name);
    } else {
      break;
    }
  }
  
  return path.join(' > ');
};

module.exports = mongoose.model('Department', departmentSchema);