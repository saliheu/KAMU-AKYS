const router = require('express').Router();
const { Op } = require('sequelize');
const { body, query, validationResult } = require('express-validator');
const { 
  Personnel, 
  User, 
  Department, 
  Position, 
  Education,
  Experience,
  EmergencyContact,
  Document,
  sequelize 
} = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { generateEmployeeId } = require('../utils/auth');
const multer = require('multer');
const path = require('path');

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/photos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, JPG and PNG images are allowed'));
  }
});

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all personnel with pagination and filters
router.get('/', authenticate, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      departmentId,
      positionId,
      status = 'active',
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { employeeId: { [Op.iLike]: `%${search}%` } },
        { nationalId: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (departmentId) where.departmentId = departmentId;
    if (positionId) where.positionId = positionId;
    if (status) where.status = status;

    const { count, rows } = await Personnel.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['email', 'role'] },
        { model: Department, as: 'department' },
        { model: Position, as: 'position' },
        { model: Personnel, as: 'manager', attributes: ['firstName', 'lastName'] }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single personnel with all details
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const personnel = await Personnel.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['email', 'role', 'lastLogin'] },
        { model: Department, as: 'department' },
        { model: Position, as: 'position' },
        { model: Personnel, as: 'manager', attributes: ['firstName', 'lastName'] },
        { model: Personnel, as: 'subordinates', attributes: ['id', 'firstName', 'lastName'] },
        { model: Education, as: 'education' },
        { model: Experience, as: 'experience' },
        { model: EmergencyContact, as: 'emergencyContacts' },
        { model: Document, as: 'documents', include: ['uploader', 'verifier'] }
      ]
    });

    if (!personnel) {
      return res.status(404).json({ error: 'Personnel not found' });
    }

    // Check permissions
    const canViewSensitive = req.user.role === 'admin' || 
                           req.user.role === 'hr_manager' ||
                           req.user.role === 'hr_staff' ||
                           personnel.userId === req.user.id;

    if (!canViewSensitive) {
      // Remove sensitive information
      delete personnel.dataValues.salary;
      delete personnel.dataValues.bankAccount;
      delete personnel.dataValues.iban;
      delete personnel.dataValues.nationalId;
    }

    res.json(personnel);
  } catch (error) {
    next(error);
  }
});

// Create new personnel
router.post('/', [
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('nationalId').isLength({ min: 11, max: 11 }),
  body('email').isEmail().normalizeEmail(),
  body('phone').notEmpty(),
  body('dateOfBirth').isDate(),
  body('gender').isIn(['male', 'female', 'other']),
  body('address').notEmpty(),
  body('city').notEmpty(),
  body('hireDate').isDate(),
  body('departmentId').isUUID(),
  body('positionId').isUUID()
], authenticate, authorize('admin', 'hr_manager', 'hr_staff'), validate, async (req, res, next) => {
  const t = await sequelize.transaction();
  
  try {
    const {
      email,
      password = 'Temp123!', // Temporary password
      role = 'employee',
      ...personnelData
    } = req.body;

    // Check if user/personnel already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      await t.rollback();
      return res.status(400).json({ error: 'Email already exists' });
    }

    const existingPersonnel = await Personnel.findOne({ 
      where: { nationalId: personnelData.nationalId } 
    });
    if (existingPersonnel) {
      await t.rollback();
      return res.status(400).json({ error: 'National ID already exists' });
    }

    // Create user account
    const user = await User.create({
      email,
      password,
      role
    }, { transaction: t });

    // Generate employee ID
    const employeeId = await generateEmployeeId(sequelize);

    // Create personnel record
    const personnel = await Personnel.create({
      ...personnelData,
      employeeId,
      userId: user.id
    }, { transaction: t });

    await t.commit();

    // Fetch complete personnel data
    const completePersonnel = await Personnel.findByPk(personnel.id, {
      include: [
        { model: User, as: 'user', attributes: ['email', 'role'] },
        { model: Department, as: 'department' },
        { model: Position, as: 'position' }
      ]
    });

    res.status(201).json(completePersonnel);
  } catch (error) {
    await t.rollback();
    next(error);
  }
});

// Update personnel
router.put('/:id', authenticate, authorize('admin', 'hr_manager', 'hr_staff'), async (req, res, next) => {
  try {
    const personnel = await Personnel.findByPk(req.params.id);
    
    if (!personnel) {
      return res.status(404).json({ error: 'Personnel not found' });
    }

    // Don't allow updating certain fields
    delete req.body.employeeId;
    delete req.body.userId;
    delete req.body.id;

    await personnel.update(req.body);

    // Fetch updated data
    const updated = await Personnel.findByPk(personnel.id, {
      include: [
        { model: User, as: 'user', attributes: ['email', 'role'] },
        { model: Department, as: 'department' },
        { model: Position, as: 'position' }
      ]
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Upload personnel photo
router.post('/:id/photo', authenticate, upload.single('photo'), async (req, res, next) => {
  try {
    const personnel = await Personnel.findByPk(req.params.id);
    
    if (!personnel) {
      return res.status(404).json({ error: 'Personnel not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        req.user.role !== 'hr_manager' && 
        req.user.role !== 'hr_staff' &&
        personnel.userId !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    await personnel.update({ photo: `/uploads/photos/${req.file.filename}` });

    res.json({ 
      message: 'Photo uploaded successfully',
      photo: personnel.photo 
    });
  } catch (error) {
    next(error);
  }
});

// Terminate personnel
router.post('/:id/terminate', [
  body('terminationDate').isDate(),
  body('terminationReason').notEmpty()
], authenticate, authorize('admin', 'hr_manager'), validate, async (req, res, next) => {
  const t = await sequelize.transaction();
  
  try {
    const { terminationDate, terminationReason } = req.body;
    
    const personnel = await Personnel.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }]
    });
    
    if (!personnel) {
      await t.rollback();
      return res.status(404).json({ error: 'Personnel not found' });
    }

    // Update personnel status
    await personnel.update({
      status: 'terminated',
      terminationDate,
      terminationReason
    }, { transaction: t });

    // Deactivate user account
    if (personnel.user) {
      await personnel.user.update({ isActive: false }, { transaction: t });
    }

    await t.commit();

    res.json({ message: 'Personnel terminated successfully' });
  } catch (error) {
    await t.rollback();
    next(error);
  }
});

// Get personnel statistics
router.get('/stats/overview', authenticate, authorize('admin', 'hr_manager'), async (req, res, next) => {
  try {
    const stats = await Personnel.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('COUNT', sequelize.literal(`CASE WHEN status = 'active' THEN 1 END`)), 'active'],
        [sequelize.fn('COUNT', sequelize.literal(`CASE WHEN status = 'on_leave' THEN 1 END`)), 'onLeave'],
        [sequelize.fn('COUNT', sequelize.literal(`CASE WHEN gender = 'male' THEN 1 END`)), 'male'],
        [sequelize.fn('COUNT', sequelize.literal(`CASE WHEN gender = 'female' THEN 1 END`)), 'female'],
        [sequelize.fn('AVG', sequelize.literal(`DATE_PART('year', AGE(NOW(), "dateOfBirth"))`)), 'avgAge']
      ],
      raw: true
    });

    const departmentStats = await Personnel.findAll({
      attributes: [
        'departmentId',
        [sequelize.fn('COUNT', sequelize.col('Personnel.id')), 'count']
      ],
      include: [{
        model: Department,
        as: 'department',
        attributes: ['name']
      }],
      group: ['Personnel.departmentId', 'department.id'],
      raw: true
    });

    res.json({
      overview: stats[0],
      byDepartment: departmentStats
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;