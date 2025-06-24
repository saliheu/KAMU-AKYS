const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token bulunamadı' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      include: ['institution']
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı' });
    }

    req.user = user;
    req.institutionId = user.institutionId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Geçersiz token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }
    next();
  };
};

const checkInstitution = (req, res, next) => {
  const requestedInstitutionId = req.params.institutionId || req.body.institutionId;
  
  if (requestedInstitutionId && req.user.role !== 'admin') {
    if (requestedInstitutionId !== req.user.institutionId) {
      return res.status(403).json({ error: 'Bu kuruma erişim yetkiniz yok' });
    }
  }
  
  next();
};

module.exports = { authenticate, authorize, checkInstitution };