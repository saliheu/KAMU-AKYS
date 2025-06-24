const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { logger } = require('../utils/logger');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Hesabınız aktif değil' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      token,
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Giriş yapılamadı' });
  }
};

exports.register = async (req, res) => {
  try {
    const userData = req.body;
    
    const existingUser = await User.findOne({
      where: { 
        [require('sequelize').Op.or]: [
          { email: userData.email },
          { sicilNo: userData.sicilNo }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email veya sicil no zaten kayıtlı' });
    }

    const user = await User.create(userData);
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({ error: 'Kayıt oluşturulamadı' });
  }
};

exports.logout = async (req, res) => {
  // Token'ı blacklist'e eklemek için Redis kullanılabilir
  res.json({ message: 'Çıkış başarılı' });
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token gerekli' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı' });
    }

    const token = generateToken(user);
    
    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: 'Geçersiz refresh token' });
  }
};