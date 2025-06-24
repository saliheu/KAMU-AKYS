const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  stationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'stations',
      key: 'id'
    }
  },
  alertRuleId: {
    type: DataTypes.UUID,
    references: {
      model: 'alert_rules',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'high_pollution',
      'very_high_pollution',
      'hazardous',
      'sensor_malfunction',
      'station_offline',
      'rapid_increase',
      'threshold_exceeded'
    ),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false
  },
  pollutant: {
    type: DataTypes.STRING
  },
  value: {
    type: DataTypes.FLOAT
  },
  threshold: {
    type: DataTypes.FLOAT
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  details: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  status: {
    type: DataTypes.ENUM('active', 'acknowledged', 'resolved', 'expired'),
    defaultValue: 'active'
  },
  triggeredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  acknowledgedAt: {
    type: DataTypes.DATE
  },
  acknowledgedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  resolvedAt: {
    type: DataTypes.DATE
  },
  resolvedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  autoResolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notificationsSent: {
    type: DataTypes.JSONB,
    defaultValue: {
      email: false,
      sms: false,
      push: false
    }
  }
}, {
  indexes: [
    {
      fields: ['stationId', 'status']
    },
    {
      fields: ['triggeredAt']
    },
    {
      fields: ['type', 'severity']
    }
  ]
});

module.exports = Alert;