const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
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
  source: {
    name: String,
    type: {
      type: String,
      enum: ['government', 'donation', 'service', 'investment', 'other']
    },
    contact: String
  },
  referenceNumber: String,
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'check', 'other'],
    default: 'bank_transfer'
  },
  status: {
    type: String,
    enum: ['expected', 'received', 'overdue', 'cancelled'],
    default: 'expected'
  },
  receivedAt: Date,
  attachments: [{
    filename: String,
    path: String,
    type: {
      type: String,
      enum: ['receipt', 'contract', 'invoice', 'other']
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
revenueSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
  // Update budget actual revenue when revenue is received
  if (this.isModified('status') && this.status === 'received') {
    const Budget = mongoose.model('Budget');
    await Budget.findByIdAndUpdate(this.budget, {
      $inc: { totalActualRevenue: this.amount }
    });
  }
  
  next();
});

// Index for efficient queries
revenueSchema.index({ department: 1, date: -1 });
revenueSchema.index({ budget: 1, category: 1 });
revenueSchema.index({ status: 1, date: 1 });

module.exports = mongoose.model('Revenue', revenueSchema);