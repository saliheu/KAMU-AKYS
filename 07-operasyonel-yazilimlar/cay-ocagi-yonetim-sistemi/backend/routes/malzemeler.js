const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Malzeme = require('../models/Malzeme');
const { auth, adminAuth } = require('../middleware/auth');

// Tüm malzemeleri getir
router.get('/', auth, async (req, res) => {
  try {
    const { kategori, stokDurumu } = req.query;
    let query = {};
    
    if (kategori) query.kategori = kategori;
    
    let malzemeler = await Malzeme.find(query).sort({ ad: 1 });
    
    // Stok durumuna göre filtreleme
    if (stokDurumu) {
      malzemeler = malzemeler.filter(m => {
        const durum = m.stokDurumu;
        return durum === stokDurumu;
      });
    }

    res.json({ success: true, data: malzemeler });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Tek malzeme getir
router.get('/:id', auth, async (req, res) => {
  try {
    const malzeme = await Malzeme.findById(req.params.id);
    if (!malzeme) {
      return res.status(404).json({ 
        success: false, 
        message: 'Malzeme bulunamadı' 
      });
    }
    res.json({ success: true, data: malzeme });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Yeni malzeme ekle
router.post('/', [auth, adminAuth], [
  body('ad').notEmpty().withMessage('Malzeme adı gerekli'),
  body('kategori').isIn(['icecek', 'yiyecek', 'temizlik', 'diger']),
  body('birim').isIn(['adet', 'paket', 'kg', 'litre', 'kutu']),
  body('birimFiyat').isNumeric().withMessage('Birim fiyat sayı olmalı')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const malzeme = new Malzeme(req.body);
    await malzeme.save();
    
    res.status(201).json({ 
      success: true, 
      data: malzeme,
      message: 'Malzeme başarıyla eklendi' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Malzeme güncelle
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const malzeme = await Malzeme.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!malzeme) {
      return res.status(404).json({ 
        success: false, 
        message: 'Malzeme bulunamadı' 
      });
    }
    
    res.json({ 
      success: true, 
      data: malzeme,
      message: 'Malzeme güncellendi' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Stok güncelle
router.patch('/:id/stok', auth, [
  body('miktar').isNumeric().withMessage('Miktar sayı olmalı'),
  body('islem').isIn(['ekle', 'cikar'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { miktar, islem } = req.body;
    const malzeme = await Malzeme.findById(req.params.id);
    
    if (!malzeme) {
      return res.status(404).json({ 
        success: false, 
        message: 'Malzeme bulunamadı' 
      });
    }

    if (islem === 'ekle') {
      malzeme.stok += Number(miktar);
    } else {
      if (malzeme.stok < miktar) {
        return res.status(400).json({ 
          success: false, 
          message: 'Yetersiz stok' 
        });
      }
      malzeme.stok -= Number(miktar);
    }

    await malzeme.save();
    
    res.json({ 
      success: true, 
      data: malzeme,
      message: 'Stok güncellendi' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Malzeme sil
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const malzeme = await Malzeme.findByIdAndDelete(req.params.id);
    
    if (!malzeme) {
      return res.status(404).json({ 
        success: false, 
        message: 'Malzeme bulunamadı' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Malzeme silindi' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;