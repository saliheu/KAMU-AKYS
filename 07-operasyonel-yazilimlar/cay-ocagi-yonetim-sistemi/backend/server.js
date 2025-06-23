const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cay-ocagi', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB bağlantısı başarılı'))
.catch(err => console.error('MongoDB bağlantı hatası:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/malzemeler', require('./routes/malzemeler'));
app.use('/api/tuketim', require('./routes/tuketim'));
app.use('/api/personel', require('./routes/personel'));
app.use('/api/raporlar', require('./routes/raporlar'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Sunucu hatası', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Çay Ocağı Yönetim Sistemi çalışıyor' });
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});