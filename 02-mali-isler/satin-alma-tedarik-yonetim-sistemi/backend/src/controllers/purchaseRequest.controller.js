const { PurchaseRequest, User } = require('../models');
const { Op } = require('sequelize');

const generateRequestNumber = async () => {
  const year = new Date().getFullYear();
  const lastRequest = await PurchaseRequest.findOne({
    where: {
      requestNumber: {
        [Op.like]: `ST-${year}-%`
      }
    },
    order: [['createdAt', 'DESC']]
  });

  let nextNumber = 1;
  if (lastRequest) {
    const lastNumber = parseInt(lastRequest.requestNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `ST-${year}-${nextNumber.toString().padStart(6, '0')}`;
};

exports.getAllRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, department, requestType } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    // Normal kullanıcılar sadece kendi taleplerini görebilir
    if (!['admin', 'satinalma_muduru', 'satinalma_uzmani'].includes(req.user.role)) {
      where.requesterId = req.user.id;
    }

    if (status) where.status = status;
    if (department) where.department = department;
    if (requestType) where.requestType = requestType;

    const { count, rows } = await PurchaseRequest.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'requester',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      requests: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalRequests: count
    });
  } catch (error) {
    res.status(500).json({ error: 'Talepler getirilemedi' });
  }
};

exports.getRequest = async (req, res) => {
  try {
    const request = await PurchaseRequest.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'requester',
        attributes: ['id', 'firstName', 'lastName', 'email', 'department']
      }]
    });
    
    if (!request) {
      return res.status(404).json({ error: 'Talep bulunamadı' });
    }

    // Yetki kontrolü
    if (request.requesterId !== req.user.id && 
        !['admin', 'satinalma_muduru', 'satinalma_uzmani'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Bu talebi görüntüleme yetkiniz yok' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Talep getirilemedi' });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      requesterId: req.user.id,
      requestNumber: await generateRequestNumber(),
      status: 'taslak'
    };

    const request = await PurchaseRequest.create(requestData);
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: 'Talep oluşturulamadı' });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const request = await PurchaseRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Talep bulunamadı' });
    }

    // Sadece taslak durumundaki talepler güncellenebilir
    if (request.status !== 'taslak') {
      return res.status(400).json({ error: 'Sadece taslak durumundaki talepler güncellenebilir' });
    }

    // Yetki kontrolü
    if (request.requesterId !== req.user.id) {
      return res.status(403).json({ error: 'Bu talebi güncelleme yetkiniz yok' });
    }

    await request.update(req.body);
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Talep güncellenemedi' });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const request = await PurchaseRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Talep bulunamadı' });
    }

    if (request.status !== 'onay_bekliyor') {
      return res.status(400).json({ error: 'Bu talep onaylanamaz' });
    }

    request.status = 'onaylandi';
    request.approvedBy = req.user.id;
    request.approvalDate = new Date();
    request.approvals = [...(request.approvals || []), {
      userId: req.user.id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      action: 'approved',
      date: new Date(),
      note: req.body.note
    }];

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Talep onaylanamadı' });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const request = await PurchaseRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Talep bulunamadı' });
    }

    if (request.status !== 'onay_bekliyor') {
      return res.status(400).json({ error: 'Bu talep reddedilemez' });
    }

    request.status = 'reddedildi';
    request.rejectionReason = req.body.reason;
    request.approvals = [...(request.approvals || []), {
      userId: req.user.id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      action: 'rejected',
      date: new Date(),
      reason: req.body.reason
    }];

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Talep reddedilemedi' });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const request = await PurchaseRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Talep bulunamadı' });
    }

    // Sadece taslak durumundaki talepler silinebilir
    if (request.status !== 'taslak') {
      return res.status(400).json({ error: 'Sadece taslak durumundaki talepler silinebilir' });
    }

    // Yetki kontrolü
    if (request.requesterId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Bu talebi silme yetkiniz yok' });
    }

    await request.destroy();
    res.json({ message: 'Talep silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Talep silinemedi' });
  }
};