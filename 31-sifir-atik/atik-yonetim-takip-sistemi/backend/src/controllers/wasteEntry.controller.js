const { WasteEntry, WastePoint, WasteContainer, User } = require('../models');
const { Op } = require('sequelize');
const { publishMessage } = require('../config/rabbitmq');
const { logger } = require('../utils/logger');

exports.getAllEntries = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      wasteType, 
      wastePointId, 
      startDate, 
      endDate,
      verified 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const where = { institutionId: req.institutionId };
    
    if (wasteType) where.wasteType = wasteType;
    if (wastePointId) where.wastePointId = wastePointId;
    if (verified !== undefined) where.verifiedAt = verified === 'true' ? { [Op.ne]: null } : null;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows } = await WasteEntry.findAndCountAll({
      where,
      include: [
        {
          model: WastePoint,
          as: 'wastePoint',
          attributes: ['id', 'name', 'location']
        },
        {
          model: User,
          as: 'enteredByUser',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'verifiedByUser',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      entries: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalEntries: count
    });
  } catch (error) {
    logger.error('Get entries error:', error);
    res.status(500).json({ error: 'Kayıtlar getirilemedi' });
  }
};

exports.getEntry = async (req, res) => {
  try {
    const entry = await WasteEntry.findOne({
      where: { 
        id: req.params.id,
        institutionId: req.institutionId 
      },
      include: [
        {
          model: WastePoint,
          as: 'wastePoint',
          include: ['containers']
        },
        {
          model: WasteContainer,
          as: 'container'
        },
        {
          model: User,
          as: 'enteredByUser'
        },
        {
          model: User,
          as: 'verifiedByUser'
        }
      ]
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }

    res.json(entry);
  } catch (error) {
    logger.error('Get entry error:', error);
    res.status(500).json({ error: 'Kayıt getirilemedi' });
  }
};

exports.createEntry = async (req, res) => {
  try {
    const entryData = {
      ...req.body,
      institutionId: req.institutionId,
      enteredBy: req.user.id,
      entryType: 'manual'
    };

    // Check if waste point belongs to user's institution
    const wastePoint = await WastePoint.findOne({
      where: {
        id: req.body.wastePointId,
        institutionId: req.institutionId
      }
    });

    if (!wastePoint) {
      return res.status(400).json({ error: 'Geçersiz atık noktası' });
    }

    const entry = await WasteEntry.create(entryData);
    
    // Update container fill level if specified
    if (req.body.containerId) {
      const container = await WasteContainer.findByPk(req.body.containerId);
      if (container) {
        // Simple calculation - can be improved with actual volume
        const fillIncrement = (req.body.quantity / container.capacity) * 100;
        container.currentFillLevel = Math.min(100, container.currentFillLevel + fillIncrement);
        
        if (container.currentFillLevel >= 80) {
          container.status = 'dolu';
          // Send notification
          await publishMessage('notifications', {
            type: 'container_full',
            containerId: container.id,
            wastePointId: wastePoint.id,
            institutionId: req.institutionId,
            fillLevel: container.currentFillLevel
          });
        }
        
        await container.save();
      }
    }

    // Send to queue for processing
    await publishMessage('waste-collection', {
      type: 'new_entry',
      entryId: entry.id,
      institutionId: req.institutionId,
      wasteType: entry.wasteType,
      quantity: entry.quantity
    });

    // Emit real-time update
    req.io.to(`institution-${req.institutionId}`).emit('wasteEntry:created', entry);

    res.status(201).json(entry);
  } catch (error) {
    logger.error('Create entry error:', error);
    res.status(500).json({ error: 'Kayıt oluşturulamadı' });
  }
};

exports.createBulkEntries = async (req, res) => {
  try {
    const { entries } = req.body;
    
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'Geçersiz veri formatı' });
    }

    const createdEntries = [];
    
    for (const entryData of entries) {
      const entry = await WasteEntry.create({
        ...entryData,
        institutionId: req.institutionId,
        enteredBy: req.user.id,
        entryType: 'bulk'
      });
      createdEntries.push(entry);
    }

    res.status(201).json({
      message: `${createdEntries.length} kayıt oluşturuldu`,
      entries: createdEntries
    });
  } catch (error) {
    logger.error('Bulk create error:', error);
    res.status(500).json({ error: 'Toplu kayıt oluşturulamadı' });
  }
};

exports.createEntryByQR = async (req, res) => {
  try {
    const { qrCode, quantity } = req.body;
    
    // Find container by QR code
    const container = await WasteContainer.findOne({
      where: { qrCode },
      include: [{
        model: WastePoint,
        as: 'wastePoint',
        where: { institutionId: req.institutionId }
      }]
    });

    if (!container) {
      return res.status(404).json({ error: 'QR kod geçersiz' });
    }

    const entry = await WasteEntry.create({
      institutionId: req.institutionId,
      wastePointId: container.wastePointId,
      containerId: container.id,
      wasteType: container.type,
      quantity,
      unit: 'kg',
      enteredBy: req.user.id,
      entryType: 'qr'
    });

    res.status(201).json(entry);
  } catch (error) {
    logger.error('QR entry error:', error);
    res.status(500).json({ error: 'QR kod ile kayıt oluşturulamadı' });
  }
};

exports.updateEntry = async (req, res) => {
  try {
    const entry = await WasteEntry.findOne({
      where: { 
        id: req.params.id,
        institutionId: req.institutionId 
      }
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }

    if (entry.verifiedAt) {
      return res.status(400).json({ error: 'Onaylanmış kayıtlar değiştirilemez' });
    }

    await entry.update(req.body);
    res.json(entry);
  } catch (error) {
    logger.error('Update entry error:', error);
    res.status(500).json({ error: 'Kayıt güncellenemedi' });
  }
};

exports.verifyEntry = async (req, res) => {
  try {
    const entry = await WasteEntry.findOne({
      where: { 
        id: req.params.id,
        institutionId: req.institutionId 
      }
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }

    if (entry.verifiedAt) {
      return res.status(400).json({ error: 'Kayıt zaten onaylanmış' });
    }

    entry.verifiedBy = req.user.id;
    entry.verifiedAt = new Date();
    await entry.save();

    res.json(entry);
  } catch (error) {
    logger.error('Verify entry error:', error);
    res.status(500).json({ error: 'Kayıt onaylanamadı' });
  }
};

exports.uploadPhotos = async (req, res) => {
  try {
    const entry = await WasteEntry.findOne({
      where: { 
        id: req.params.id,
        institutionId: req.institutionId 
      }
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }

    // In production, upload to cloud storage
    const photoUrls = req.files.map(file => `/uploads/${file.filename}`);
    
    entry.photos = [...(entry.photos || []), ...photoUrls];
    await entry.save();

    res.json({
      message: 'Fotoğraflar yüklendi',
      photos: entry.photos
    });
  } catch (error) {
    logger.error('Upload photos error:', error);
    res.status(500).json({ error: 'Fotoğraflar yüklenemedi' });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const entry = await WasteEntry.findOne({
      where: { 
        id: req.params.id,
        institutionId: req.institutionId 
      }
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }

    if (entry.verifiedAt) {
      return res.status(400).json({ error: 'Onaylanmış kayıtlar silinemez' });
    }

    await entry.destroy();
    res.json({ message: 'Kayıt silindi' });
  } catch (error) {
    logger.error('Delete entry error:', error);
    res.status(500).json({ error: 'Kayıt silinemedi' });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'wasteType' } = req.query;
    
    const where = { institutionId: req.institutionId };
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    // Get total waste by type
    const wasteByType = await WasteEntry.findAll({
      where,
      attributes: [
        'wasteType',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'entryCount']
      ],
      group: ['wasteType']
    });

    // Get daily trend
    const dailyTrend = await WasteEntry.findAll({
      where,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    const totalWaste = wasteByType.reduce((sum, item) => sum + parseFloat(item.dataValues.totalQuantity), 0);
    
    // Calculate recycling rate (simplified)
    const recyclableTypes = ['kağıt', 'plastik', 'cam', 'metal'];
    const recyclableWaste = wasteByType
      .filter(item => recyclableTypes.includes(item.wasteType))
      .reduce((sum, item) => sum + parseFloat(item.dataValues.totalQuantity), 0);
    
    const recyclingRate = totalWaste > 0 ? (recyclableWaste / totalWaste) * 100 : 0;

    res.json({
      totalWaste,
      recyclingRate: recyclingRate.toFixed(2),
      wasteByType,
      dailyTrend,
      period: { startDate, endDate }
    });
  } catch (error) {
    logger.error('Get statistics error:', error);
    res.status(500).json({ error: 'İstatistikler alınamadı' });
  }
};