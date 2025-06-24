const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AlertRule = sequelize.define('AlertRule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  type: {
    type: DataTypes.ENUM(
      'threshold',
      'rate_of_change',
      'consecutive_readings',
      'station_status',
      'sensor_status'
    ),
    allowNull: false
  },
  pollutant: {
    type: DataTypes.ENUM('pm25', 'pm10', 'co', 'no2', 'so2', 'o3', 'aqi'),
    allowNull: true
  },
  condition: {
    type: DataTypes.ENUM('greater_than', 'less_than', 'equals', 'not_equals'),
    allowNull: false
  },
  threshold: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Duration in minutes for which condition must be true'
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  scope: {
    type: DataTypes.ENUM('global', 'station', 'region'),
    defaultValue: 'global'
  },
  stationIds: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  },
  regions: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  notificationChannels: {
    type: DataTypes.JSONB,
    defaultValue: {
      email: true,
      sms: false,
      push: true
    }
  },
  notificationRecipients: {
    type: DataTypes.JSONB,
    defaultValue: {
      roles: ['admin', 'operator'],
      userIds: [],
      emails: []
    }
  },
  cooldownPeriod: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
    comment: 'Minutes before same alert can be triggered again'
  },
  autoResolve: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  autoResolveThreshold: {
    type: DataTypes.FLOAT,
    comment: 'Value at which alert auto-resolves'
  }
});

module.exports = AlertRule;