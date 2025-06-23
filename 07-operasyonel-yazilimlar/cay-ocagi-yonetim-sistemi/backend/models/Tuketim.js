const mongoose = require('mongoose');

const tuketimSchema = new mongoose.Schema({
  malzeme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Malzeme',
    required: true
  },
  miktar: {
    type: Number,
    required: true,
    min: 0
  },
  tarih: {
    type: Date,
    default: Date.now
  },
  kaydeden: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tur: {
    type: String,
    enum: ['tuketim', 'stok_girisi'],
    default: 'tuketim'
  },
  aciklama: {
    type: String,
    maxlength: 300
  },
  maliyet: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// İşlem öncesi maliyet hesaplama
tuketimSchema.pre('save', async function(next) {
  if (!this.maliyet && this.malzeme) {
    const malzeme = await mongoose.model('Malzeme').findById(this.malzeme);
    if (malzeme) {
      this.maliyet = malzeme.birimFiyat * this.miktar;
    }
  }
  next();
});

module.exports = mongoose.model('Tuketim', tuketimSchema);