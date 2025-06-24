const express = require('express');
const router = express.Router();
const { Document, User, Version, Workflow, Share } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

router.get('/dashboard', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Document statistics
    const totalDocuments = await Document.count();
    const myDocuments = await Document.count({ where: { createdBy: req.user.id } });
    const sharedWithMe = await Share.count({ 
      where: { sharedWith: req.user.id, isActive: true } 
    });

    // Recent activity
    const recentDocuments = await Document.count({
      where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
    });

    // Document by status
    const documentsByStatus = await Document.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status']
    });

    // Document by category
    const documentsByCategory = await Document.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('category')), 'count']
      ],
      group: ['category']
    });

    // Workflow statistics
    const activeWorkflows = await Workflow.count({
      where: { status: 'in_progress' }
    });

    const myPendingWorkflows = await Workflow.count({
      where: {
        status: 'in_progress',
        steps: {
          [Op.contains]: [{
            assignedTo: req.user.id,
            status: 'pending'
          }]
        }
      }
    });

    // Version statistics
    const totalVersions = await Version.count();
    const averageVersionsPerDocument = totalDocuments > 0 
      ? (totalVersions / totalDocuments).toFixed(2) 
      : 0;

    // Storage statistics
    const storageStats = await Document.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('fileSize')), 'totalSize'],
        [sequelize.fn('AVG', sequelize.col('fileSize')), 'avgSize']
      ]
    });

    res.json({
      overview: {
        totalDocuments,
        myDocuments,
        sharedWithMe,
        recentDocuments
      },
      documentsByStatus: documentsByStatus.map(item => ({
        status: item.status,
        count: parseInt(item.dataValues.count)
      })),
      documentsByCategory: documentsByCategory.map(item => ({
        category: item.category,
        count: parseInt(item.dataValues.count)
      })),
      workflows: {
        active: activeWorkflows,
        myPending: myPendingWorkflows
      },
      versions: {
        total: totalVersions,
        averagePerDocument: parseFloat(averageVersionsPerDocument)
      },
      storage: {
        totalSize: parseInt(storageStats[0]?.dataValues.totalSize || 0),
        averageSize: parseInt(storageStats[0]?.dataValues.avgSize || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating dashboard data', error: error.message });
  }
});

router.get('/activity', auth, async (req, res) => {
  try {
    const { 
      dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      dateTo = new Date(),
      groupBy = 'day'
    } = req.query;

    const dateFormat = groupBy === 'day' ? 'YYYY-MM-DD' : 'YYYY-MM';

    const documentActivity = await Document.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', groupBy, sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.between]: [dateFrom, dateTo]
        }
      },
      group: [sequelize.fn('DATE_TRUNC', groupBy, sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE_TRUNC', groupBy, sequelize.col('createdAt')), 'ASC']]
    });

    const versionActivity = await Version.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', groupBy, sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.between]: [dateFrom, dateTo]
        }
      },
      group: [sequelize.fn('DATE_TRUNC', groupBy, sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE_TRUNC', groupBy, sequelize.col('createdAt')), 'ASC']]
    });

    res.json({
      documents: documentActivity.map(item => ({
        date: item.dataValues.date,
        count: parseInt(item.dataValues.count)
      })),
      versions: versionActivity.map(item => ({
        date: item.dataValues.date,
        count: parseInt(item.dataValues.count)
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating activity report', error: error.message });
  }
});

router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const userStats = await User.findAll({
      attributes: [
        'id',
        'name',
        'email',
        'role',
        'department',
        'lastLogin',
        [sequelize.fn('COUNT', sequelize.col('documents.id')), 'documentCount']
      ],
      include: [
        {
          model: Document,
          as: 'documents',
          attributes: []
        }
      ],
      group: ['User.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('documents.id')), 'DESC']]
    });

    res.json({
      users: userStats.map(user => ({
        ...user.toJSON(),
        documentCount: parseInt(user.dataValues.documentCount)
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating user report', error: error.message });
  }
});

router.post('/export', auth, async (req, res) => {
  try {
    const { 
      format = 'excel',
      reportType = 'documents',
      filters = {}
    } = req.body;

    let data;
    
    switch (reportType) {
      case 'documents':
        const where = {};
        if (filters.dateFrom) where.createdAt = { [Op.gte]: filters.dateFrom };
        if (filters.dateTo) {
          where.createdAt = { ...where.createdAt, [Op.lte]: filters.dateTo };
        }
        if (filters.category) where.category = filters.category;
        if (filters.status) where.status = filters.status;

        data = await Document.findAll({
          where,
          include: [
            { model: User, as: 'creator', attributes: ['name', 'email'] }
          ],
          order: [['createdAt', 'DESC']]
        });
        break;

      case 'workflows':
        data = await Workflow.findAll({
          include: [
            { model: Document, as: 'document', attributes: ['title'] },
            { model: User, as: 'initiator', attributes: ['name', 'email'] }
          ],
          order: [['createdAt', 'DESC']]
        });
        break;

      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(reportType);

      // Add headers based on report type
      if (reportType === 'documents') {
        worksheet.columns = [
          { header: 'Title', key: 'title', width: 30 },
          { header: 'Category', key: 'category', width: 15 },
          { header: 'Status', key: 'status', width: 15 },
          { header: 'Creator', key: 'creator', width: 25 },
          { header: 'Created Date', key: 'createdAt', width: 20 },
          { header: 'File Size', key: 'fileSize', width: 15 },
          { header: 'Version', key: 'currentVersion', width: 10 }
        ];

        data.forEach(doc => {
          worksheet.addRow({
            title: doc.title,
            category: doc.category,
            status: doc.status,
            creator: doc.creator.name,
            createdAt: doc.createdAt,
            fileSize: doc.fileSize,
            currentVersion: doc.currentVersion
          });
        });
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report.xlsx`);
      
      await workbook.xlsx.write(res);
      res.end();
    } else if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report.pdf`);
      
      doc.pipe(res);
      
      // Add title
      doc.fontSize(20).text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, {
        align: 'center'
      });
      doc.moveDown();
      
      // Add content based on report type
      if (reportType === 'documents') {
        data.forEach(item => {
          doc.fontSize(12).text(`Title: ${item.title}`);
          doc.fontSize(10).text(`Category: ${item.category} | Status: ${item.status}`);
          doc.text(`Creator: ${item.creator.name}`);
          doc.text(`Created: ${new Date(item.createdAt).toLocaleDateString()}`);
          doc.moveDown();
        });
      }
      
      doc.end();
    } else {
      res.status(400).json({ message: 'Invalid export format' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error exporting report', error: error.message });
  }
});

module.exports = router;