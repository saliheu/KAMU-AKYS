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
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  disasterId: {
    type: DataTypes.UUID,
    references: {
      model: 'Disasters',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'alert',
      'assignment',
      'update',
      'request',
      'approval',
      'reminder',
      'system',
      'emergency'
    ),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
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
  channels: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: ['in_app']
    // ['in_app', 'email', 'sms', 'push']
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE
  },
  sentAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  deliveryStatus: {
    type: DataTypes.JSONB,
    defaultValue: {
      in_app: 'sent',
      email: null,
      sms: null,
      push: null
    }
  },
  actionRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  actionUrl: {
    type: DataTypes.STRING
  },
  expiresAt: {
    type: DataTypes.DATE
  },
  relatedEntity: {
    type: DataTypes.JSONB,
    defaultValue: {
      type: null, // 'help_request', 'resource_request', 'team', etc.
      id: null
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'isRead']
    },
    {
      fields: ['type']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['disasterId']
    }
  ]
});

module.exports = Notification;