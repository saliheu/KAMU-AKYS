const express = require('express');
const router = express.Router();
const Tuketim = require('../models/Tuketim');
const Malzeme = require('../models/Malzeme');
const { auth } = require('../middleware/auth');

// Aylık rapor
router.get('/aylik', auth, async (req, res) => {
  try {
    const { yil, ay } = req.query;
    
    const baslangic = new Date(yil, ay - 1, 1);
    const bitis = new Date(yil, ay, 0, 23, 59, 59);

    const raporData = await Tuketim.aggregate([
      {
        $match: {
          tarih: { $gte: baslangic, $lte: bitis },
          tur: 'tuketim'
        }
      },
      {
        $group: {
          _id: {
            malzeme: '$malzeme',
            gun: { $dayOfMonth: '$tarih' }
          },
          gunlukMiktar: { $sum: '$miktar' },
          gunlukMaliyet: { $sum: '$maliyet' }
        }
      },
      {
        $group: {
          _id: '$_id.malzeme',
          gunlukTuketimler: {
            $push: {
              gun: '$_id.gun',
              miktar: '$gunlukMiktar',
              maliyet: '$gunlukMaliyet'
            }
          },
          toplamMiktar: { $sum: '$gunlukMiktar' },
          toplamMaliyet: { $sum: '$gunlukMaliyet' },
          ortalamaMiktar: { $avg: '$gunlukMiktar' }
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
        $sort: { toplamMaliyet: -1 }
      }
    ]);

    const toplamMaliyet = raporData.reduce((sum, item) => sum + item.toplamMaliyet, 0);

    res.json({
      success: true,
      data: {
        donem: `${yil}-${String(ay).padStart(2, '0')}`,
        malzemeler: raporData,
        toplamMaliyet,
        malzemeSayisi: raporData.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Stok durumu raporu
router.get('/stok-durumu', auth, async (req, res) => {
  try {
    const malzemeler = await Malzeme.find().sort({ kategori: 1, ad: 1 });
    
    const stokDegeri = malzemeler.reduce((sum, m) => sum + (m.stok * m.birimFiyat), 0);
    
    const kategoriBazli = malzemeler.reduce((acc, m) => {
      if (!acc[m.kategori]) {
        acc[m.kategori] = {
          adet: 0,
          toplamStok: 0,
          toplamDeger: 0,
          kritikMalzemeler: []
        };
      }
      
      acc[m.kategori].adet++;
      acc[m.kategori].toplamStok += m.stok;
      acc[m.kategori].toplamDeger += m.stok * m.birimFiyat;
      
      if (m.stok <= m.minimumStok) {
        acc[m.kategori].kritikMalzemeler.push({
          ad: m.ad,
          stok: m.stok,
          minimumStok: m.minimumStok
        });
      }
      
      return acc;
    }, {});

    const kritikMalzemeler = malzemeler.filter(m => m.stok <= m.minimumStok);

    res.json({
      success: true,
      data: {
        toplamMalzemeSayisi: malzemeler.length,
        toplamStokDegeri: stokDegeri,
        kritikMalzemeSayisi: kritikMalzemeler.length,
        kategoriBazli,
        kritikMalzemeler: kritikMalzemeler.map(m => ({
          id: m._id,
          ad: m.ad,
          kategori: m.kategori,
          stok: m.stok,
          minimumStok: m.minimumStok,
          eksikMiktar: m.minimumStok - m.stok
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Maliyet analizi
router.get('/maliyet-analizi', auth, async (req, res) => {
  try {
    const { baslangic, bitis } = req.query;
    
    let dateFilter = {};
    if (baslangic) dateFilter.$gte = new Date(baslangic);
    if (bitis) dateFilter.$lte = new Date(bitis);
    
    const query = { tur: 'tuketim' };
    if (Object.keys(dateFilter).length > 0) {
      query.tarih = dateFilter;
    }

    const analiz = await Tuketim.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            yil: { $year: '$tarih' },
            ay: { $month: '$tarih' }
          },
          toplamMaliyet: { $sum: '$maliyet' },
          islemSayisi: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.yil': -1, '_id.ay': -1 }
      },
      {
        $limit: 12
      }
    ]);

    const kategoriBazli = await Tuketim.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'malzemes',
          localField: 'malzeme',
          foreignField: '_id',
          as: 'malzemeDetay'
        }
      },
      { $unwind: '$malzemeDetay' },
      {
        $group: {
          _id: '$malzemeDetay.kategori',
          toplamMaliyet: { $sum: '$maliyet' },
          toplamMiktar: { $sum: '$miktar' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        aylikTrend: analiz,
        kategoriBazli,
        toplamMaliyet: kategoriBazli.reduce((sum, k) => sum + k.toplamMaliyet, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;