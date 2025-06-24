const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Share = sequelize.define('Share', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  documentId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  sharedBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  sharedWith: {
    type: DataTypes.UUID
  },
  shareType: {
    type: DataTypes.ENUM('user', 'department', 'public', 'link'),
    defaultValue: 'user'
  },
  permissions: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: ['view']
  },
  shareLink: {
    type: DataTypes.STRING,
    unique: true
  },
  password: {
    type: DataTypes.STRING
  },
  expiresAt: {
    type: DataTypes.DATE
  },
  maxDownloads: {
    type: DataTypes.INTEGER
  },
  downloadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastAccessedAt: {
    type: DataTypes.DATE
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notes: {
    type: DataTypes.TEXT
  }
});

module.exports = Share;