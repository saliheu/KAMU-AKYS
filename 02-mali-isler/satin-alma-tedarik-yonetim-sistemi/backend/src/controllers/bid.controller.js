const { Bid, Tender, Supplier } = require('../models');

exports.getBidsByTender = async (req, res) => {
  try {
    const bids = await Bid.findAll({
      where: { tenderId: req.params.tenderId },
      include: [{
        model: Supplier,
        as: 'supplier',
        attributes: ['id', 'companyName', 'taxNumber', 'rating']
      }],
      order: [['totalScore', 'DESC']]
    });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: 'Teklifler getirilemedi' });
  }
};

exports.getBid = async (req, res) => {
  try {
    const bid = await Bid.findByPk(req.params.id, {
      include: [
        {
          model: Supplier,
          as: 'supplier'
        },
        {
          model: Tender,
          as: 'tender',
          attributes: ['id', 'tenderNumber', 'tenderMethod']
        }
      ]
    });
    
    if (!bid) {
      return res.status(404).json({ error: 'Teklif bulunamadı' });
    }

    res.json(bid);
  } catch (error) {
    res.status(500).json({ error: 'Teklif getirilemedi' });
  }
};

exports.createBid = async (req, res) => {
  try {
    const tender = await Tender.findByPk(req.body.tenderId);
    
    if (!tender) {
      return res.status(404).json({ error: 'İhale bulunamadı' });
    }

    if (tender.status !== 'teklif_toplama') {
      return res.status(400).json({ error: 'Bu ihale teklif kabul etmiyor' });
    }

    // Teklif son tarihini kontrol et
    if (new Date() > new Date(tender.deadlineDate)) {
      return res.status(400).json({ error: 'Teklif verme süresi dolmuş' });
    }

    // Aynı tedarikçiden birden fazla teklif kontrolü
    const existingBid = await Bid.findOne({
      where: {
        tenderId: req.body.tenderId,
        supplierId: req.body.supplierId
      }
    });

    if (existingBid) {
      return res.status(409).json({ error: 'Bu ihaleye zaten teklif verdiniz' });
    }

    const bid = await Bid.create(req.body);
    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ error: 'Teklif oluşturulamadı' });
  }
};

exports.updateBid = async (req, res) => {
  try {
    const bid = await Bid.findByPk(req.params.id);
    
    if (!bid) {
      return res.status(404).json({ error: 'Teklif bulunamadı' });
    }

    if (bid.status !== 'teslim_edildi') {
      return res.status(400).json({ error: 'Bu teklif güncellenemez' });
    }

    const tender = await Tender.findByPk(bid.tenderId);
    if (new Date() > new Date(tender.deadlineDate)) {
      return res.status(400).json({ error: 'Teklif güncelleme süresi dolmuş' });
    }

    await bid.update(req.body);
    res.json(bid);
  } catch (error) {
    res.status(500).json({ error: 'Teklif güncellenemedi' });
  }
};

exports.evaluateBid = async (req, res) => {
  try {
    const bid = await Bid.findByPk(req.params.id);
    
    if (!bid) {
      return res.status(404).json({ error: 'Teklif bulunamadı' });
    }

    const { technicalScore, priceScore, status, notes } = req.body;

    bid.technicalScore = technicalScore;
    bid.priceScore = priceScore;
    bid.totalScore = (technicalScore * 0.4) + (priceScore * 0.6); // %40 teknik, %60 fiyat
    bid.status = status || 'degerlendiriliyor';
    if (notes) bid.notes = notes;

    await bid.save();
    res.json(bid);
  } catch (error) {
    res.status(500).json({ error: 'Teklif değerlendirilemedi' });
  }
};

exports.deleteBid = async (req, res) => {
  try {
    const bid = await Bid.findByPk(req.params.id);
    
    if (!bid) {
      return res.status(404).json({ error: 'Teklif bulunamadı' });
    }

    if (bid.status !== 'teslim_edildi') {
      return res.status(400).json({ error: 'Bu teklif silinemez' });
    }

    bid.status = 'geri_cekildi';
    await bid.save();

    res.json({ message: 'Teklif geri çekildi' });
  } catch (error) {
    res.status(500).json({ error: 'Teklif silinemedi' });
  }
};