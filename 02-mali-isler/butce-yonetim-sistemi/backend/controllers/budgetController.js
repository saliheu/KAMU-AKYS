const Budget = require('../models/Budget');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

// Get all budgets
exports.getBudgets = async (req, res, next) => {
  try {
    const { department, year, type, status } = req.query;
    const filter = {};

    // Apply filters based on user role
    if (req.user.role === 'viewer' || req.user.role === 'analyst') {
      filter.department = req.user.department._id;
    } else if (department) {
      filter.department = department;
    }

    if (year) filter.year = year;
    if (type) filter.type = type;
    if (status) filter.status = status;

    const budgets = await Budget.find(filter)
      .populate('department', 'name code')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('items.category', 'name code type')
      .sort('-year -createdAt');

    res.json({ budgets });
  } catch (error) {
    next(error);
  }
};

// Get single budget
exports.getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id)
      .populate('department', 'name code')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('items.category', 'name code type');

    if (!budget) {
      return res.status(404).json({ error: 'Bütçe bulunamadı' });
    }

    // Check access permission
    if (req.user.role === 'viewer' || req.user.role === 'analyst') {
      if (budget.department._id.toString() !== req.user.department._id.toString()) {
        return res.status(403).json({ error: 'Bu bütçeye erişim yetkiniz yok' });
      }
    }

    res.json({ budget });
  } catch (error) {
    next(error);
  }
};

// Create new budget
exports.createBudget = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, department, year, quarter, month, type, items, notes } = req.body;

    // Check if budget already exists for the period
    const existingBudget = await Budget.findOne({
      department,
      year,
      type,
      ...(type === 'quarterly' && { quarter }),
      ...(type === 'monthly' && { month })
    });

    if (existingBudget) {
      return res.status(400).json({
        error: 'Bu dönem için zaten bir bütçe mevcut'
      });
    }

    // Validate categories
    const categoryIds = items.map(item => item.category);
    const categories = await Category.find({ _id: { $in: categoryIds } });
    
    if (categories.length !== categoryIds.length) {
      return res.status(400).json({
        error: 'Geçersiz kategori ID\'si'
      });
    }

    // Create budget
    const budget = new Budget({
      name,
      department: department || req.user.department._id,
      year,
      quarter,
      month,
      type,
      items: items.map(item => ({
        ...item,
        category: categories.find(cat => cat._id.toString() === item.category)
      })),
      notes,
      createdBy: req.user._id
    });

    await budget.save();
    await budget.populate('department createdBy items.category');

    // Send notification
    const io = req.app.get('io');
    io.to(`department-${budget.department._id}`).emit('budgetCreated', {
      budget: budget._id,
      message: `Yeni bütçe oluşturuldu: ${budget.name}`
    });

    res.status(201).json({
      message: 'Bütçe başarıyla oluşturuldu',
      budget
    });
  } catch (error) {
    next(error);
  }
};

// Update budget
exports.updateBudget = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ error: 'Bütçe bulunamadı' });
    }

    // Check if budget can be edited
    if (!budget.canEdit()) {
      return res.status(400).json({
        error: 'Bu bütçe düzenlenemez. Sadece taslak veya reddedilmiş bütçeler düzenlenebilir.'
      });
    }

    // Update budget
    const { name, items, notes } = req.body;
    
    if (name) budget.name = name;
    if (items) {
      // Validate categories
      const categoryIds = items.map(item => item.category);
      const categories = await Category.find({ _id: { $in: categoryIds } });
      
      budget.items = items.map(item => ({
        ...item,
        category: categories.find(cat => cat._id.toString() === item.category)
      }));
    }
    if (notes !== undefined) budget.notes = notes;

    await budget.save();
    await budget.populate('department createdBy approvedBy items.category');

    res.json({
      message: 'Bütçe güncellendi',
      budget
    });
  } catch (error) {
    next(error);
  }
};

// Submit budget for approval
exports.submitBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ error: 'Bütçe bulunamadı' });
    }

    if (budget.status !== 'draft' && budget.status !== 'rejected') {
      return res.status(400).json({
        error: 'Sadece taslak veya reddedilmiş bütçeler onaya gönderilebilir'
      });
    }

    budget.status = 'submitted';
    await budget.save();

    // Send notification to managers
    const io = req.app.get('io');
    io.emit('budgetSubmitted', {
      budget: budget._id,
      department: budget.department,
      message: `Yeni bütçe onay bekliyor: ${budget.name}`
    });

    res.json({
      message: 'Bütçe onaya gönderildi',
      budget
    });
  } catch (error) {
    next(error);
  }
};

// Approve budget
exports.approveBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ error: 'Bütçe bulunamadı' });
    }

    if (!budget.canApprove()) {
      return res.status(400).json({
        error: 'Bu bütçe onaylanamaz. Sadece gönderilmiş bütçeler onaylanabilir.'
      });
    }

    budget.status = 'approved';
    budget.approvedBy = req.user._id;
    budget.approvedAt = new Date();
    await budget.save();

    // Send notification
    const io = req.app.get('io');
    io.to(`department-${budget.department}`).emit('budgetApproved', {
      budget: budget._id,
      message: `Bütçe onaylandı: ${budget.name}`
    });

    res.json({
      message: 'Bütçe onaylandı',
      budget
    });
  } catch (error) {
    next(error);
  }
};

// Reject budget
exports.rejectBudget = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        error: 'Red nedeni belirtilmelidir'
      });
    }

    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ error: 'Bütçe bulunamadı' });
    }

    if (!budget.canApprove()) {
      return res.status(400).json({
        error: 'Bu bütçe reddedilemez. Sadece gönderilmiş bütçeler reddedilebilir.'
      });
    }

    budget.status = 'rejected';
    budget.rejectionReason = reason;
    await budget.save();

    // Send notification
    const io = req.app.get('io');
    io.to(`department-${budget.department}`).emit('budgetRejected', {
      budget: budget._id,
      message: `Bütçe reddedildi: ${budget.name}`,
      reason
    });

    res.json({
      message: 'Bütçe reddedildi',
      budget
    });
  } catch (error) {
    next(error);
  }
};

// Delete budget
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ error: 'Bütçe bulunamadı' });
    }

    if (budget.status !== 'draft') {
      return res.status(400).json({
        error: 'Sadece taslak bütçeler silinebilir'
      });
    }

    await budget.deleteOne();

    res.json({
      message: 'Bütçe silindi'
    });
  } catch (error) {
    next(error);
  }
};