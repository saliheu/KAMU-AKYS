const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Version = sequelize.define('Version', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  documentId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  versionNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER
  },
  changes: {
    type: DataTypes.TEXT
  },
  changeType: {
    type: DataTypes.ENUM('minor', 'major', 'revision'),
    defaultValue: 'minor'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  checksum: {
    type: DataTypes.STRING
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Version;