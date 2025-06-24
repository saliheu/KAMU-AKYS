const router = require('express').Router();
const { body, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { 
  Case, User, Client, Court, Hearing, 
  Document, Note, Task, sequelize 
} = require('../models');
const { authenticate, authorize, checkCaseAccess } = require('../middleware/auth');
const logger = require('../utils/logger');
const { cache } = require('../config/redis');
const notificationService = require('../services/notificationService');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all cases with filtering and pagination
router.get('/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['pending', 'active', 'on_hold', 'closed', 'won', 'lost', 'settled', 'appealed', 'archived']),
    query('type').optional(),
    query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    query('lawyerId').optional().isUUID(),
    query('clientId').optional().isUUID(),
    query('courtId').optional().isUUID(),
    query('search').optional().trim()
  ],
  validate,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      // Build where clause
      const where = {};
      
      if (req.query.status) where.status = req.query.status;
      if (req.query.type) where.type = req.query.type;
      if (req.query.priority) where.priority = req.query.priority;
      if (req.query.lawyerId) where.assignedLawyerId = req.query.lawyerId;
      if (req.query.clientId) where.clientId = req.query.clientId;
      if (req.query.courtId) where.courtId = req.query.courtId;

      if (req.query.search) {
        where[Op.or] = [
          { caseNumber: { [Op.iLike]: `%${req.query.search}%` } },
          { courtFileNumber: { [Op.iLike]: `%${req.query.search}%` } },
          { title: { [Op.iLike]: `%${req.query.search}%` } },
          { description: { [Op.iLike]: `%${req.query.search}%` } }
        ];
      }

      // Apply access control for non-admin users
      if (req.user.role !== 'admin') {
        where[Op.or] = [
          { assignedLawyerId: req.user.id },
          { accessList: { [Op.contains]: [req.user.id] } },
          { '$teamMembers.id$': req.user.id }
        ];
      }

      const { count, rows: cases } = await Case.findAndCountAll({
        where,
        include: [
          { 
            model: Client, 
            as: 'client',
            attributes: ['id', 'name', 'surname', 'companyName', 'type']
          },
          { 
            model: User, 
            as: 'assignedLawyer',
            attributes: ['id', 'name', 'surname', 'email']
          },
          { 
            model: Court, 
            as: 'court',
            attributes: ['id', 'name', 'type', 'city']
          },
          {
            model: User,
            as: 'teamMembers',
            attributes: ['id', 'name', 'surname'],
            through: { attributes: [] }
          }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        distinct: true
      });

      res.json({
        cases,
        pagination: {
          total: count,
          page,
          pages: Math.ceil(count / limit),
          limit
        }
      });
    } catch (error) {
      logger.error('Get cases error:', error);
      res.status(500).json({ error: 'Failed to fetch cases' });
    }
  }
);

// Get single case
router.get('/:id',
  authenticate,
  checkCaseAccess,
  async (req, res) => {
    try {
      const caseData = await Case.findByPk(req.params.id, {
        include: [
          { 
            model: Client, 
            as: 'client'
          },
          { 
            model: User, 
            as: 'assignedLawyer',
            attributes: ['id', 'name', 'surname', 'email', 'phone', 'barNumber']
          },
          { 
            model: Court, 
            as: 'court'
          },
          {
            model: User,
            as: 'teamMembers',
            attributes: ['id', 'name', 'surname', 'email', 'role'],
            through: { attributes: [] }
          },
          {
            model: Hearing,
            as: 'hearings',
            order: [['hearingDate', 'DESC']],
            limit: 5
          },
          {
            model: Document,
            as: 'documents',
            order: [['createdAt', 'DESC']],
            limit: 10
          },
          {
            model: Note,
            as: 'notes',
            order: [['createdAt', 'DESC']],
            limit: 5,
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['id', 'name', 'surname']
              }
            ]
          },
          {
            model: Task,
            as: 'tasks',
            where: { status: ['pending', 'in_progress'] },
            required: false,
            order: [['dueDate', 'ASC']],
            limit: 5
          }
        ]
      });

      if (!caseData) {
        return res.status(404).json({ error: 'Case not found' });
      }

      res.json({ case: caseData });
    } catch (error) {
      logger.error('Get case error:', error);
      res.status(500).json({ error: 'Failed to fetch case' });
    }
  }
);

// Create case
router.post('/',
  authenticate,
  authorize('admin', 'lawyer', 'secretary'),
  [
    body('caseNumber').notEmpty().trim(),
    body('title').notEmpty().trim(),
    body('type').notEmpty().isIn(['civil', 'criminal', 'administrative', 'labor', 'commercial', 'family', 'enforcement', 'bankruptcy', 'intellectual_property', 'tax', 'other']),
    body('clientId').isUUID(),
    body('courtId').isUUID(),
    body('assignedLawyerId').isUUID(),
    body('filingDate').isISO8601(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('claimAmount').optional().isNumeric(),
    body('description').optional().trim()
  ],
  validate,
  async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
      // Check if case number already exists
      const existing = await Case.findOne({ 
        where: { caseNumber: req.body.caseNumber } 
      });
      
      if (existing) {
        await t.rollback();
        return res.status(400).json({ error: 'Case number already exists' });
      }

      // Create case
      const caseData = await Case.create({
        ...req.body,
        status: 'pending',
        timeline: [{
          date: new Date(),
          event: 'Case created',
          userId: req.user.id,
          userName: `${req.user.name} ${req.user.surname}`
        }]
      }, { transaction: t });

      // Add creator to team members
      await caseData.addTeamMember(req.user.id, { transaction: t });

      // Create initial task
      await Task.create({
        caseId: caseData.id,
        title: 'Initial case review',
        description: 'Review case details and prepare initial strategy',
        type: 'research',
        assignedTo: req.body.assignedLawyerId,
        assignedBy: req.user.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        priority: req.body.priority || 'medium'
      }, { transaction: t });

      // Send notification to assigned lawyer
      await notificationService.createNotification({
        userId: req.body.assignedLawyerId,
        type: 'new_case_assignment',
        title: 'New Case Assignment',
        message: `You have been assigned to case: ${caseData.caseNumber} - ${caseData.title}`,
        relatedId: caseData.id,
        relatedType: 'case',
        priority: req.body.priority || 'medium'
      }, { transaction: t });

      await t.commit();

      // Fetch complete case data
      const newCase = await Case.findByPk(caseData.id, {
        include: [
          { model: Client, as: 'client' },
          { model: User, as: 'assignedLawyer' },
          { model: Court, as: 'court' }
        ]
      });

      logger.info(`Case created: ${caseData.caseNumber} by user ${req.user.id}`);

      res.status(201).json({ case: newCase });
    } catch (error) {
      await t.rollback();
      logger.error('Create case error:', error);
      res.status(500).json({ error: 'Failed to create case' });
    }
  }
);

// Update case
router.put('/:id',
  authenticate,
  authorize('admin', 'lawyer', 'secretary'),
  checkCaseAccess,
  [
    body('title').optional().trim(),
    body('description').optional().trim(),
    body('status').optional().isIn(['pending', 'active', 'on_hold', 'closed', 'won', 'lost', 'settled', 'appealed', 'archived']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('opposingParty').optional().trim(),
    body('opposingLawyer').optional().trim(),
    body('claimAmount').optional().isNumeric()
  ],
  validate,
  async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
      const caseData = req.case;
      const updates = { ...req.body };

      // Track status change
      if (updates.status && updates.status !== caseData.status) {
        if (!caseData.timeline) caseData.timeline = [];
        caseData.timeline.push({
          date: new Date(),
          event: `Status changed from ${caseData.status} to ${updates.status}`,
          userId: req.user.id,
          userName: `${req.user.name} ${req.user.surname}`
        });
        
        // Set closing date if case is closed
        if (['closed', 'won', 'lost', 'settled'].includes(updates.status)) {
          updates.closingDate = new Date();
        }

        // Notify team members
        const teamMembers = await caseData.getTeamMembers();
        for (const member of teamMembers) {
          if (member.id !== req.user.id) {
            await notificationService.createNotification({
              userId: member.id,
              type: 'case_update',
              title: 'Case Status Updated',
              message: `Case ${caseData.caseNumber} status changed to ${updates.status}`,
              relatedId: caseData.id,
              relatedType: 'case',
              priority: 'medium'
            }, { transaction: t });
          }
        }
      }

      // Update case
      await caseData.update(updates, { transaction: t });
      
      await t.commit();

      // Invalidate cache
      await cache.del(`case:${caseData.id}`);

      res.json({ case: caseData });
    } catch (error) {
      await t.rollback();
      logger.error('Update case error:', error);
      res.status(500).json({ error: 'Failed to update case' });
    }
  }
);

// Add team member
router.post('/:id/team',
  authenticate,
  authorize('admin', 'lawyer'),
  checkCaseAccess,
  [body('userId').isUUID()],
  validate,
  async (req, res) => {
    try {
      const { userId } = req.body;
      
      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Add to team
      await req.case.addTeamMember(userId);

      // Send notification
      await notificationService.createNotification({
        userId,
        type: 'new_case_assignment',
        title: 'Added to Case Team',
        message: `You have been added to case: ${req.case.caseNumber} - ${req.case.title}`,
        relatedId: req.case.id,
        relatedType: 'case',
        priority: 'medium'
      });

      logger.info(`User ${userId} added to case ${req.case.id} team by ${req.user.id}`);

      res.json({ message: 'Team member added successfully' });
    } catch (error) {
      logger.error('Add team member error:', error);
      res.status(500).json({ error: 'Failed to add team member' });
    }
  }
);

// Remove team member
router.delete('/:id/team/:userId',
  authenticate,
  authorize('admin', 'lawyer'),
  checkCaseAccess,
  async (req, res) => {
    try {
      await req.case.removeTeamMember(req.params.userId);
      
      logger.info(`User ${req.params.userId} removed from case ${req.case.id} team by ${req.user.id}`);
      
      res.json({ message: 'Team member removed successfully' });
    } catch (error) {
      logger.error('Remove team member error:', error);
      res.status(500).json({ error: 'Failed to remove team member' });
    }
  }
);

// Get case statistics
router.get('/:id/stats',
  authenticate,
  checkCaseAccess,
  async (req, res) => {
    try {
      const stats = await cache.get(`case:${req.params.id}:stats`);
      if (stats) {
        return res.json(stats);
      }

      const [
        hearingCount,
        documentCount,
        taskStats,
        expenseTotal
      ] = await Promise.all([
        Hearing.count({ where: { caseId: req.params.id } }),
        Document.count({ where: { caseId: req.params.id, isDeleted: false } }),
        Task.findAll({
          where: { caseId: req.params.id },
          attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('status')), 'count']
          ],
          group: ['status']
        }),
        req.case.expenses?.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0) || 0
      ]);

      const result = {
        hearingCount,
        documentCount,
        taskStats: taskStats.reduce((acc, stat) => {
          acc[stat.status] = parseInt(stat.dataValues.count);
          return acc;
        }, {}),
        expenseTotal,
        daysActive: Math.floor((new Date() - new Date(req.case.filingDate)) / (1000 * 60 * 60 * 24))
      };

      await cache.set(`case:${req.params.id}:stats`, result, 3600);

      res.json(result);
    } catch (error) {
      logger.error('Get case stats error:', error);
      res.status(500).json({ error: 'Failed to fetch case statistics' });
    }
  }
);

module.exports = router;