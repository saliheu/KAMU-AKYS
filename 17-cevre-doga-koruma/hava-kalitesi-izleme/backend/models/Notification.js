const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('alert', 'system', 'report', 'maintenance'),
    allowNull: false
  },
  channel: {
    type: DataTypes.ENUM('email', 'sms', 'push', 'in_app'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  data: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'failed', 'read'),
    defaultValue: 'pending'
  },
  sentAt: {
    type: DataTypes.DATE
  },
  readAt: {
    type: DataTypes.DATE
  },
  error: {
    type: DataTypes.TEXT
  },
  retries: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = Notification;