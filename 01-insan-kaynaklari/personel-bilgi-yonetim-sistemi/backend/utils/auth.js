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

const generateEmployeeId = async (sequelize) => {
  const year = new Date().getFullYear();
  const [result] = await sequelize.query(
    `SELECT COUNT(*) as count FROM "Personnel" WHERE "employeeId" LIKE '${year}%'`
  );
  const count = parseInt(result[0].count) + 1;
  return `${year}${count.toString().padStart(5, '0')}`;
};

const checkPermission = (userRole, requiredRoles) => {
  const roleHierarchy = {
    admin: 5,
    hr_manager: 4,
    hr_staff: 3,
    manager: 2,
    employee: 1
  };

  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = Math.max(...requiredRoles.map(role => roleHierarchy[role] || 0));

  return userLevel >= requiredLevel;
};

module.exports = {
  generateToken,
  verifyToken,
  generateEmployeeId,
  checkPermission
};