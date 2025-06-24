const { Tender, PurchaseRequest, Bid, Supplier } = require('../models');
const { Op } = require('sequelize');

const generateTenderNumber = async () => {
  const year = new Date().getFullYear();
  const lastTender = await Tender.findOne({
    where: {
      tenderNumber: {
        [Op.like]: `IH-${year}-%`
      }
    },
    order: [['createdAt', 'DESC']]
  });

  let nextNumber = 1;
  if (lastTender) {
    const lastNumber = parseInt(lastTender.tenderNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `IH-${year}-${nextNumber.toString().padStart(6, '0')}`;
};

exports.getAllTenders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, tenderMethod } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (tenderMethod) where.tenderMethod = tenderMethod;

    const { count, rows } = await Tender.findAndCountAll({
      where,
      include: [{
        model: PurchaseRequest,
        as: 'purchaseRequest',
        attributes: ['id', 'title', 'requestNumber']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      tenders: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalTenders: count
    });
  } catch (error) {
    res.status(500).json({ error: 'İhaleler getirilemedi' });
  }
};

exports.getTender = async (req, res) => {
  try {
    const tender = await Tender.findByPk(req.params.id, {
      include: [
        {
          model: PurchaseRequest,
          as: 'purchaseRequest'
        },
        {
          model: Bid,
          as: 'bids',
          include: [{
            model: Supplier,
            as: 'supplier',
            attributes: ['id', 'companyName', 'taxNumber']
          }]
        }
      ]
    });
    
    if (!tender) {
      return res.status(404).json({ error: 'İhale bulunamadı' });
    }

    res.json(tender);
  } catch (error) {
    res.status(500).json({ error: 'İhale getirilemedi' });
  }
};

exports.createTender = async (req, res) => {
  try {
    // Satın alma talebini kontrol et
    const purchaseRequest = await PurchaseRequest.findByPk(req.body.purchaseRequestId);
    
    if (!purchaseRequest) {
      return res.status(404).json({ error: 'Satın alma talebi bulunamadı' });
    }

    if (purchaseRequest.status !== 'onaylandi') {
      return res.status(400).json({ error: 'Sadece onaylı talepler için ihale oluşturulabilir' });
    }

    const tenderData = {
      ...req.body,
      tenderNumber: await generateTenderNumber(),
      createdBy: req.user.id,
      status: 'hazirlaniyor'
    };

    const tender = await Tender.create(tenderData);
    
    // Satın alma talebini güncelle
    purchaseRequest.status = 'ihale_asamasinda';
    await purchaseRequest.save();

    res.status(201).json(tender);
  } catch (error) {
    res.status(500).json({ error: 'İhale oluşturulamadı' });
  }
};

exports.updateTender = async (req, res) => {
  try {
    const tender = await Tender.findByPk(req.params.id);
    
    if (!tender) {
      return res.status(404).json({ error: 'İhale bulunamadı' });
    }

    if (!['hazirlaniyor', 'ilan_edildi'].includes(tender.status)) {
      return res.status(400).json({ error: 'Bu aşamada ihale güncellenemez' });
    }

    await tender.update(req.body);
    res.json(tender);
  } catch (error) {
    res.status(500).json({ error: 'İhale güncellenemedi' });
  }
};

exports.publishTender = async (req, res) => {
  try {
    const tender = await Tender.findByPk(req.params.id);
    
    if (!tender) {
      return res.status(404).json({ error: 'İhale bulunamadı' });
    }

    if (tender.status !== 'hazirlaniyor') {
      return res.status(400).json({ error: 'Bu ihale yayınlanamaz' });
    }

    tender.status = 'ilan_edildi';
    await tender.save();

    res.json(tender);
  } catch (error) {
    res.status(500).json({ error: 'İhale yayınlanamadı' });
  }
};

exports.cancelTender = async (req, res) => {
  try {
    const tender = await Tender.findByPk(req.params.id);
    
    if (!tender) {
      return res.status(404).json({ error: 'İhale bulunamadı' });
    }

    if (tender.status === 'sonuclandi') {
      return res.status(400).json({ error: 'Sonuçlanmış ihale iptal edilemez' });
    }

    tender.status = 'iptal';
    await tender.save();

    // Satın alma talebini güncelle
    const purchaseRequest = await PurchaseRequest.findByPk(tender.purchaseRequestId);
    if (purchaseRequest) {
      purchaseRequest.status = 'onaylandi';
      await purchaseRequest.save();
    }

    res.json(tender);
  } catch (error) {
    res.status(500).json({ error: 'İhale iptal edilemedi' });
  }
};

exports.deleteTender = async (req, res) => {
  try {
    const tender = await Tender.findByPk(req.params.id);
    
    if (!tender) {
      return res.status(404).json({ error: 'İhale bulunamadı' });
    }

    if (tender.status !== 'hazirlaniyor') {
      return res.status(400).json({ error: 'Sadece hazırlık aşamasındaki ihaleler silinebilir' });
    }

    await tender.destroy();
    res.json({ message: 'İhale silindi' });
  } catch (error) {
    res.status(500).json({ error: 'İhale silinemedi' });
  }
};