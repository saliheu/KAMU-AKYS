const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly', 'custom'),
    allowNull: false
  },
  format: {
    type: DataTypes.ENUM('pdf', 'excel', 'csv', 'json'),
    defaultValue: 'pdf'
  },
  parameters: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Report generation parameters'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  stationIds: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  },
  regions: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('pending', 'generating', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  filePath: {
    type: DataTypes.STRING
  },
  fileSize: {
    type: DataTypes.INTEGER
  },
  generatedAt: {
    type: DataTypes.DATE
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  error: {
    type: DataTypes.TEXT
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
});

module.exports = Report;