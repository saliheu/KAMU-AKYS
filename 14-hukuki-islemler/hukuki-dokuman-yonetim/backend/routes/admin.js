const express = require('express');
const router = express.Router();
const { User, Document, Version, Workflow } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

router.use(auth, authorize('admin'));

// User management
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      department,
      isActive
    } = req.query;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (role) where.role = role;
    if (department) where.department = department;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const users = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      users: users.rows,
      total: users.count,
      page: parseInt(page),
      totalPages: Math.ceil(users.count / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role, department, title } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
      title
    });

    res.status(201).json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, role, department, title, isActive } = req.body;

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.department = department || user.department;
    user.title = title || user.title;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

router.post('/users/:id/reset-password', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    user.password = tempPassword;
    await user.save();

    // In production, send email with temporary password
    res.json({ 
      message: 'Password reset successfully',
      tempPassword // Remove in production
    });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

// System settings
router.get('/settings', async (req, res) => {
  try {
    const redisClient = req.app.get('redisClient');
    const settings = await redisClient.get('system_settings');
    
    res.json({ 
      settings: settings ? JSON.parse(settings) : {
        maxFileSize: 52428800,
        allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'rtf', 'odt'],
        versionRetentionDays: 90,
        maxVersionsPerDocument: 50,
        requireDigitalSignature: false,
        defaultConfidentialityLevel: 'internal',
        emailNotifications: true,
        maintenanceMode: false
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const redisClient = req.app.get('redisClient');
    await redisClient.set('system_settings', JSON.stringify(req.body));
    
    res.json({ message: 'Settings updated successfully', settings: req.body });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
});

// System statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const totalDocuments = await Document.count();
    const totalVersions = await Version.count();
    const activeWorkflows = await Workflow.count({ where: { status: 'in_progress' } });
    
    const storageUsed = await Document.sum('fileSize') || 0;
    const averageDocumentSize = await Document.findAll({
      attributes: [[sequelize.fn('AVG', sequelize.col('fileSize')), 'avgSize']]
    });

    const documentsByMonth = await Document.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        }
      },
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']]
    });

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers
      },
      documents: {
        total: totalDocuments,
        totalVersions,
        activeWorkflows
      },
      storage: {
        used: storageUsed,
        averageDocumentSize: parseInt(averageDocumentSize[0]?.dataValues.avgSize || 0)
      },
      activity: {
        documentsByMonth: documentsByMonth.map(item => ({
          month: item.dataValues.month,
          count: parseInt(item.dataValues.count)
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

// Audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      userId,
      action,
      dateFrom,
      dateTo
    } = req.query;

    // In production, implement proper audit logging
    const logs = [];

    res.json({
      logs,
      total: 0,
      page: parseInt(page),
      totalPages: 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
});

// Maintenance
router.post('/maintenance/cleanup', async (req, res) => {
  try {
    const { type = 'all' } = req.body;
    
    let deletedVersions = 0;
    let deletedDocuments = 0;
    
    if (type === 'versions' || type === 'all') {
      const settings = await req.app.get('redisClient').get('system_settings');
      const { versionRetentionDays = 90 } = settings ? JSON.parse(settings) : {};
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - versionRetentionDays);
      
      const result = await Version.update(
        { isArchived: true },
        {
          where: {
            createdAt: { [Op.lt]: cutoffDate },
            isArchived: false
          }
        }
      );
      
      deletedVersions = result[0];
    }
    
    if (type === 'documents' || type === 'all') {
      const result = await Document.destroy({
        where: {
          status: 'archived',
          updatedAt: { [Op.lt]: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }
        }
      });
      
      deletedDocuments = result;
    }
    
    res.json({
      message: 'Cleanup completed successfully',
      deleted: {
        versions: deletedVersions,
        documents: deletedDocuments
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error performing cleanup', error: error.message });
  }
});

router.post('/maintenance/reindex', async (req, res) => {
  try {
    const esClient = req.app.get('esClient');
    
    // Delete and recreate index
    await esClient.indices.delete({ index: 'documents' });
    await esClient.indices.create({
      index: 'documents',
      body: {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            title: { 
              type: 'text',
              fields: {
                suggest: { type: 'completion' }
              }
            },
            description: { type: 'text' },
            content: { type: 'text' },
            category: { type: 'keyword' },
            tags: { type: 'keyword' },
            status: { type: 'keyword' },
            createdBy: { type: 'keyword' },
            createdAt: { type: 'date' }
          }
        }
      }
    });
    
    // Reindex all documents
    const documents = await Document.findAll();
    const bulkOps = [];
    
    for (const doc of documents) {
      bulkOps.push(
        { index: { _index: 'documents', _id: doc.id } },
        {
          id: doc.id,
          title: doc.title,
          description: doc.description,
          content: doc.fullTextContent,
          category: doc.category,
          tags: doc.tags,
          status: doc.status,
          createdBy: doc.createdBy,
          createdAt: doc.createdAt
        }
      );
    }
    
    if (bulkOps.length > 0) {
      await esClient.bulk({ body: bulkOps });
    }
    
    res.json({
      message: 'Reindexing completed successfully',
      documentsIndexed: documents.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error reindexing documents', error: error.message });
  }
});

module.exports = router;