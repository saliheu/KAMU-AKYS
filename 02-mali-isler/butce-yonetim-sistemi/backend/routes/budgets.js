const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const budgetController = require('../controllers/budgetController');
const { authorize, authorizeRole } = require('../middleware/auth');

// Validation rules
const createBudgetValidation = [
  body('name')
    .notEmpty()
    .withMessage('Bütçe adı zorunludur'),
  body('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Geçerli bir yıl giriniz'),
  body('type')
    .isIn(['annual', 'quarterly', 'monthly'])
    .withMessage('Geçerli bir bütçe tipi seçiniz'),
  body('quarter')
    .if(body('type').equals('quarterly'))
    .isInt({ min: 1, max: 4 })
    .withMessage('Geçerli bir çeyrek seçiniz'),
  body('month')
    .if(body('type').equals('monthly'))
    .isInt({ min: 1, max: 12 })
    .withMessage('Geçerli bir ay seçiniz'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('En az bir bütçe kalemi girilmelidir'),
  body('items.*.category')
    .isMongoId()
    .withMessage('Geçerli bir kategori seçiniz'),
  body('items.*.plannedAmount')
    .isFloat({ min: 0 })
    .withMessage('Planlanan tutar 0 veya daha büyük olmalıdır')
];

const updateBudgetValidation = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Bütçe adı boş olamaz'),
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('En az bir bütçe kalemi girilmelidir'),
  body('items.*.category')
    .optional()
    .isMongoId()
    .withMessage('Geçerli bir kategori seçiniz'),
  body('items.*.plannedAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Planlanan tutar 0 veya daha büyük olmalıdır')
];

// Routes
router.get('/', authorize('budget.create', 'budget.edit', 'report.view'), budgetController.getBudgets);
router.get('/:id', authorize('budget.create', 'budget.edit', 'report.view'), budgetController.getBudget);
router.post('/', authorize('budget.create'), createBudgetValidation, budgetController.createBudget);
router.put('/:id', authorize('budget.edit'), updateBudgetValidation, budgetController.updateBudget);
router.post('/:id/submit', authorize('budget.edit'), budgetController.submitBudget);
router.post('/:id/approve', authorize('budget.approve'), budgetController.approveBudget);
router.post('/:id/reject', authorize('budget.approve'), budgetController.rejectBudget);
router.delete('/:id', authorize('budget.delete'), budgetController.deleteBudget);

module.exports = router;