const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      where: { 
        id: decoded.id,
        isActive: true
      }
    });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by user ${req.user.id} to ${req.path}`);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const checkCaseAccess = async (req, res, next) => {
  try {
    const { Case } = require('../models');
    const caseId = req.params.caseId || req.params.id;
    
    if (!caseId) {
      return next();
    }

    const caseRecord = await Case.findByPk(caseId, {
      include: [
        { association: 'assignedLawyer', attributes: ['id'] },
        { association: 'teamMembers', attributes: ['id'] }
      ]
    });

    if (!caseRecord) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Check if user has access
    const hasAccess = req.user.role === 'admin' ||
      caseRecord.assignedLawyerId === req.user.id ||
      caseRecord.teamMembers.some(member => member.id === req.user.id) ||
      caseRecord.accessList.includes(req.user.id);

    if (!hasAccess && caseRecord.isConfidential) {
      return res.status(403).json({ error: 'Access denied to this case' });
    }

    req.case = caseRecord;
    next();
  } catch (error) {
    logger.error('Case access check error:', error);
    res.status(500).json({ error: 'Failed to verify case access' });
  }
};

module.exports = {
  authenticate,
  authorize,
  checkCaseAccess
};