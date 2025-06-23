const mongoose = require('mongoose');

const budgetItemSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  description: String,
  plannedAmount: {
    type: Number,
    required: true,
    min: 0
  },
  notes: String
});

const budgetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  quarter: {
    type: Number,
    min: 1,
    max: 4
  },
  month: {
    type: Number,
    min: 1,
    max: 12
  },
  type: {
    type: String,
    enum: ['annual', 'quarterly', 'monthly'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected', 'active', 'closed'],
    default: 'draft'
  },
  items: [budgetItemSchema],
  totalPlannedExpense: {
    type: Number,
    default: 0
  },
  totalPlannedRevenue: {
    type: Number,
    default: 0
  },
  totalActualExpense: {
    type: Number,
    default: 0
  },
  totalActualRevenue: {
    type: Number,
    default: 0
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  notes: String,
  attachments: [{
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Calculate total planned amounts before saving
budgetSchema.pre('save', function(next) {
  this.totalPlannedExpense = this.items
    .filter(item => item.category && item.category.type === 'expense')
    .reduce((total, item) => total + item.plannedAmount, 0);
  
  this.totalPlannedRevenue = this.items
    .filter(item => item.category && item.category.type === 'revenue')
    .reduce((total, item) => total + item.plannedAmount, 0);
  
  this.updatedAt = Date.now();
  next();
});

// Compound index for unique budget per department/period
budgetSchema.index({ department: 1, year: 1, type: 1, quarter: 1, month: 1 }, { unique: true });

// Check if budget can be edited
budgetSchema.methods.canEdit = function() {
  return ['draft', 'rejected'].includes(this.status);
};

// Check if budget can be approved
budgetSchema.methods.canApprove = function() {
  return this.status === 'submitted';
};

// Get budget utilization percentage
budgetSchema.methods.getUtilization = function() {
  if (this.totalPlannedExpense === 0) return 0;
  return (this.totalActualExpense / this.totalPlannedExpense) * 100;
};

module.exports = mongoose.model('Budget', budgetSchema);