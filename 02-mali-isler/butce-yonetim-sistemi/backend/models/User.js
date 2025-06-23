const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir email adresi giriniz']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'analyst', 'viewer'],
    default: 'viewer'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  permissions: [{
    type: String,
    enum: ['budget.create', 'budget.edit', 'budget.delete', 'budget.approve', 
           'expense.create', 'expense.edit', 'expense.delete', 'expense.approve',
           'revenue.create', 'revenue.edit', 'revenue.delete',
           'report.view', 'report.export', 'user.manage']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamp
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Default permissions based on role
userSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('role')) {
    switch (this.role) {
      case 'admin':
        this.permissions = [
          'budget.create', 'budget.edit', 'budget.delete', 'budget.approve',
          'expense.create', 'expense.edit', 'expense.delete', 'expense.approve',
          'revenue.create', 'revenue.edit', 'revenue.delete',
          'report.view', 'report.export', 'user.manage'
        ];
        break;
      case 'manager':
        this.permissions = [
          'budget.create', 'budget.edit', 'budget.approve',
          'expense.create', 'expense.edit', 'expense.approve',
          'revenue.create', 'revenue.edit',
          'report.view', 'report.export'
        ];
        break;
      case 'analyst':
        this.permissions = [
          'budget.create', 'budget.edit',
          'expense.create', 'expense.edit',
          'revenue.create', 'revenue.edit',
          'report.view', 'report.export'
        ];
        break;
      case 'viewer':
        this.permissions = ['report.view'];
        break;
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);