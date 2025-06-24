const router = require('express').Router();
const { body, query, validationResult } = require('express-validator');
const { Report, Station } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get reports
router.get('/', authenticate, [
  query('type').optional().isIn(['daily', 'weekly', 'monthly', 'yearly', 'custom']),
  query('status').optional().isIn(['pending', 'generating', 'completed', 'failed']),
  query('format').optional().isIn(['pdf', 'excel', 'csv', 'json']),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt()
], validate, async (req, res, next) => {
  try {
    const {
      type,
      status,
      format,
      limit = 50,
      offset = 0
    } = req.query;

    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (format) where.format = format;

    // Non-admin users can only see their own reports
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
      where.createdBy = req.user.id;
    }

    const { count, rows: reports } = await Report.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email']
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: count,
      limit,
      offset,
      reports
    });
  } catch (error) {
    next(error);
  }
});

// Get report by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check access
    if (req.user.role !== 'super_admin' && 
        req.user.role !== 'admin' && 
        report.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(report);
  } catch (error) {
    next(error);
  }
});

// Generate report
router.post('/generate', authenticate, [
  body('type').isIn(['daily', 'weekly', 'monthly', 'yearly', 'custom']),
  body('format').optional().isIn(['pdf', 'excel', 'csv', 'json']),
  body('startDate').isISO8601().toDate(),
  body('endDate').isISO8601().toDate(),
  body('stationIds').optional().isArray(),
  body('stationIds.*').optional().isUUID(),
  body('regions').optional().isArray(),
  body('parameters').optional().isObject()
], validate, async (req, res, next) => {
  try {
    const {
      type,
      format = 'pdf',
      startDate,
      endDate,
      stationIds = [],
      regions = [],
      parameters = {}
    } = req.body;

    // Validate date range
    if (endDate < startDate) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Create report record
    const report = await Report.create({
      title: generateReportTitle(type, startDate, endDate),
      type,
      format,
      parameters,
      startDate,
      endDate,
      stationIds,
      regions,
      status: 'pending',
      createdBy: req.user.id
    });

    // Queue report generation
    // In a real system, this would be handled by a job queue
    setTimeout(() => generateReportAsync(report.id), 0);

    res.status(201).json({
      message: 'Report generation started',
      reportId: report.id
    });
  } catch (error) {
    next(error);
  }
});

// Download report
router.get('/:id/download', authenticate, async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check access
    if (req.user.role !== 'super_admin' && 
        req.user.role !== 'admin' && 
        report.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (report.status !== 'completed') {
      return res.status(400).json({ error: 'Report is not ready for download' });
    }

    if (!report.filePath) {
      return res.status(404).json({ error: 'Report file not found' });
    }

    // Check if file exists
    try {
      await fs.access(report.filePath);
    } catch (err) {
      return res.status(404).json({ error: 'Report file not found' });
    }

    // Set appropriate headers based on format
    const contentTypes = {
      pdf: 'application/pdf',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
      json: 'application/json'
    };

    res.setHeader('Content-Type', contentTypes[report.format] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(report.filePath)}"`);

    const fileStream = fs.createReadStream(report.filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
});

// Delete report
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check access
    if (req.user.role !== 'super_admin' && 
        req.user.role !== 'admin' && 
        report.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete file if exists
    if (report.filePath) {
      try {
        await fs.unlink(report.filePath);
      } catch (err) {
        // File might not exist
      }
    }

    await report.destroy();
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get report templates
router.get('/templates/list', authenticate, async (req, res, next) => {
  try {
    const templates = [
      {
        id: 'daily-summary',
        name: 'Günlük Özet Raporu',
        description: 'Tüm istasyonların günlük hava kalitesi özeti',
        type: 'daily',
        parameters: ['date', 'includeCharts', 'includeAlerts']
      },
      {
        id: 'station-monthly',
        name: 'İstasyon Aylık Raporu',
        description: 'Seçili istasyonun aylık detaylı analizi',
        type: 'monthly',
        parameters: ['stationId', 'month', 'year', 'includeComparison']
      },
      {
        id: 'regional-analysis',
        name: 'Bölgesel Analiz Raporu',
        description: 'Bölge bazında karşılaştırmalı analiz',
        type: 'custom',
        parameters: ['regions', 'dateRange', 'pollutants']
      },
      {
        id: 'compliance-report',
        name: 'Uyumluluk Raporu',
        description: 'Yasal limit aşımları ve uyumluluk durumu',
        type: 'custom',
        parameters: ['dateRange', 'thresholds', 'includeViolations']
      }
    ];

    res.json(templates);
  } catch (error) {
    next(error);
  }
});

// Helper functions
function generateReportTitle(type, startDate, endDate) {
  const typeLabels = {
    daily: 'Günlük',
    weekly: 'Haftalık',
    monthly: 'Aylık',
    yearly: 'Yıllık',
    custom: 'Özel'
  };

  const start = new Date(startDate).toLocaleDateString('tr-TR');
  const end = new Date(endDate).toLocaleDateString('tr-TR');

  return `${typeLabels[type]} Hava Kalitesi Raporu (${start} - ${end})`;
}

async function generateReportAsync(reportId) {
  try {
    const report = await Report.findByPk(reportId);
    if (!report) return;

    await report.update({ status: 'generating' });

    // TODO: Implement actual report generation based on format
    // This is a placeholder implementation

    const reportsDir = path.join(__dirname, '..', 'reports');
    await fs.mkdir(reportsDir, { recursive: true });

    const filename = `report_${report.id}_${Date.now()}.${report.format}`;
    const filePath = path.join(reportsDir, filename);

    // Generate dummy content
    if (report.format === 'json') {
      const content = {
        reportId: report.id,
        title: report.title,
        generatedAt: new Date(),
        data: {
          // Placeholder data
          summary: 'Report data would be here'
        }
      };
      await fs.writeFile(filePath, JSON.stringify(content, null, 2));
    } else {
      // For other formats, create empty file
      await fs.writeFile(filePath, 'Report content would be generated here');
    }

    const stats = await fs.stat(filePath);

    await report.update({
      status: 'completed',
      filePath,
      fileSize: stats.size,
      generatedAt: new Date()
    });
  } catch (error) {
    await report.update({
      status: 'failed',
      error: error.message
    });
  }
}

module.exports = router;