const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Tuketim = require('../models/Tuketim');
const Malzeme = require('../models/Malzeme');
const { auth } = require('../middleware/auth');

// Tüketim listesi
router.get('/', auth, async (req, res) => {
  try {
    const { tarihBaslangic, tarihBitis, malzeme, tur } = req.query;
    let query = {};
    
    if (tarihBaslangic || tarihBitis) {
      query.tarih = {};
      if (tarihBaslangic) query.tarih.$gte = new Date(tarihBaslangic);
      if (tarihBitis) query.tarih.$lte = new Date(tarihBitis);
    }
    
    if (malzeme) query.malzeme = malzeme;
    if (tur) query.tur = tur;
    
    const tuketimler = await Tuketim.find(query)
      .populate('malzeme', 'ad kategori birim')
      .populate('kaydeden', 'username')
      .sort({ tarih: -1 })
      .limit(100);
    
    res.json({ success: true, data: tuketimler });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Yeni tüketim kaydı
router.post('/', auth, [
  body('malzeme').isMongoId().withMessage('Geçerli malzeme ID gerekli'),
  body('miktar').isNumeric().isFloat({ min: 0.1 }).withMessage('Miktar 0\'dan büyük olmalı'),
  body('tur').isIn(['tuketim', 'stok_girisi'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { malzeme: malzemeId, miktar, tur, aciklama } = req.body;
    
    // Malzeme kontrolü
    const malzeme = await Malzeme.findById(malzemeId);
    if (!malzeme) {
      return res.status(404).json({ 
        success: false, 
        message: 'Malzeme bulunamadı' 
      });
    }

    // Stok kontrolü (tüketim için)
    if (tur === 'tuketim' && malzeme.stok < miktar) {
      return res.status(400).json({ 
        success: false, 
        message: 'Yetersiz stok. Mevcut stok: ' + malzeme.stok 
      });
    }

    // Tüketim kaydı oluştur
    const tuketim = new Tuketim({
      malzeme: malzemeId,
      miktar,
      tur,
      aciklama,
      kaydeden: req.userId
    });
    
    await tuketim.save();

    // Stok güncelle
    if (tur === 'tuketim') {
      malzeme.stok -= miktar;
    } else {
      malzeme.stok += miktar;
    }
    await malzeme.save();

    // Populate edilmiş veriyi döndür
    await tuketim.populate('malzeme', 'ad kategori birim');
    await tuketim.populate('kaydeden', 'username');

    res.status(201).json({ 
      success: true, 
      data: tuketim,
      message: 'Tüketim kaydı oluşturuldu' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Günlük özet
router.get('/gunluk-ozet', auth, async (req, res) => {
  try {
    const { tarih } = req.query;
    const secilenTarih = tarih ? new Date(tarih) : new Date();
    
    const baslangic = new Date(secilenTarih);
    baslangic.setHours(0, 0, 0, 0);
    
    const bitis = new Date(secilenTarih);
    bitis.setHours(23, 59, 59, 999);

    const tuketimler = await Tuketim.aggregate([
      {
        $match: {
          tarih: { $gte: baslangic, $lte: bitis },
          tur: 'tuketim'
        }
      },
      {
        $group: {
          _id: '$malzeme',
          toplamMiktar: { $sum: '$miktar' },
          toplamMaliyet: { $sum: '$maliyet' },
          islemSayisi: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'malzemes',
          localField: '_id',
          foreignField: '_id',
          as: 'malzeme'
        }
      },
      {
        $unwind: '$malzeme'
      },
      {
        $project: {
          malzeme: {
            ad: '$malzeme.ad',
            kategori: '$malzeme.kategori',
            birim: '$malzeme.birim'
          },
          toplamMiktar: 1,
          toplamMaliyet: 1,
          islemSayisi: 1
        }
      }
    ]);

    const toplamMaliyet = tuketimler.reduce((sum, item) => sum + item.toplamMaliyet, 0);

    res.json({ 
      success: true, 
      data: {
        tarih: secilenTarih,
        tuketimler,
        toplamMaliyet,
        toplamIslem: tuketimler.reduce((sum, item) => sum + item.islemSayisi, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;