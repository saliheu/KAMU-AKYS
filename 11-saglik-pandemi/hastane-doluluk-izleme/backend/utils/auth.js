const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const checkPermission = (userRole, requiredRoles) => {
  const roleHierarchy = {
    super_admin: 5,
    admin: 4,
    hospital_admin: 3,
    department_head: 2,
    viewer: 1
  };

  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = Math.min(...requiredRoles.map(role => roleHierarchy[role] || 0));

  return userLevel >= requiredLevel;
};

const canAccessHospital = async (user, hospitalId) => {
  if (user.role === 'super_admin' || user.role === 'admin') {
    return true;
  }

  const userHospitals = await user.getHospitals();
  return userHospitals.some(h => h.id === hospitalId);
};

module.exports = {
  generateToken,
  verifyToken,
  checkPermission,
  canAccessHospital
};