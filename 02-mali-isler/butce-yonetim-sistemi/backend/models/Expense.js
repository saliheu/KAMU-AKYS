const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  budget: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true
  },
  vendor: {
    name: String,
    taxId: String,
    contact: String
  },
  invoiceNumber: String,
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'credit_card', 'check', 'other'],
    default: 'bank_transfer'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid', 'cancelled'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  paidAt: Date,
  rejectionReason: String,
  attachments: [{
    filename: String,
    path: String,
    type: {
      type: String,
      enum: ['invoice', 'receipt', 'contract', 'other']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  notes: String,
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly']
    },
    endDate: Date
  },
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

// Update timestamp and budget actuals
expenseSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
  // Update budget actual expense when expense is approved
  if (this.isModified('status') && this.status === 'approved') {
    const Budget = mongoose.model('Budget');
    await Budget.findByIdAndUpdate(this.budget, {
      $inc: { totalActualExpense: this.amount }
    });
  }
  
  next();
});

// Index for efficient queries
expenseSchema.index({ department: 1, date: -1 });
expenseSchema.index({ budget: 1, category: 1 });
expenseSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Expense', expenseSchema);