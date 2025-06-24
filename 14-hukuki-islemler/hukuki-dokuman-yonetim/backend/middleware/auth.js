const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
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

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    }
    next();
  };
};

const checkDocumentAccess = async (req, res, next) => {
  try {
    const { Document, Share } = require('../models');
    const documentId = req.params.id || req.body.documentId;
    
    const document = await Document.findByPk(documentId);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user is creator
    if (document.createdBy === req.user.id) {
      req.document = document;
      return next();
    }

    // Check if user has share access
    const share = await Share.findOne({
      where: {
        documentId,
        sharedWith: req.user.id,
        isActive: true
      }
    });

    if (!share) {
      // Check department access
      const departmentShare = await Share.findOne({
        where: {
          documentId,
          shareType: 'department',
          isActive: true
        }
      });

      if (!departmentShare || departmentShare.sharedWith !== req.user.department) {
        return res.status(403).json({ 
          message: 'You do not have access to this document' 
        });
      }
    }

    req.document = document;
    req.share = share;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking document access' });
  }
};

module.exports = { auth, authorize, checkDocumentAccess };