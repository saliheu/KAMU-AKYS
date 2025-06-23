const mongoose = require('mongoose');

const malzemeSchema = new mongoose.Schema({
  ad: {
    type: String,
    required: true,
    trim: true
  },
  kategori: {
    type: String,
    enum: ['icecek', 'yiyecek', 'temizlik', 'diger'],
    required: true
  },
  birim: {
    type: String,
    enum: ['adet', 'paket', 'kg', 'litre', 'kutu'],
    required: true
  },
  stok: {
    type: Number,
    default: 0,
    min: 0
  },
  minimumStok: {
    type: Number,
    default: 10,
    min: 0
  },
  birimFiyat: {
    type: Number,
    required: true,
    min: 0
  },
  tedarikci: {
    type: String,
    trim: true
  },
  notlar: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Stok durumu kontrolü
malzemeSchema.virtual('stokDurumu').get(function() {
  if (this.stok === 0) return 'tukendi';
  if (this.stok <= this.minimumStok) return 'kritik';
  return 'yeterli';
});

module.exports = mongoose.model('Malzeme', malzemeSchema);