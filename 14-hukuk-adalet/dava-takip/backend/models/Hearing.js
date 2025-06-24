const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Hearing extends Model {}

Hearing.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  caseId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  hearingDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  hearingTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  courtRoom: {
    type: DataTypes.STRING
  },
  type: {
    type: DataTypes.ENUM(
      'preliminary', 'main', 'evidence', 'witness',
      'expert', 'final', 'verdict', 'appeal', 'other'
    ),
    defaultValue: 'main'
  },
  status: {
    type: DataTypes.ENUM(
      'scheduled', 'completed', 'postponed', 
      'cancelled', 'ongoing'
    ),
    defaultValue: 'scheduled'
  },
  judge: {
    type: DataTypes.STRING
  },
  prosecutor: {
    type: DataTypes.STRING
  },
  clerk: {
    type: DataTypes.STRING
  },
  attendees: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  agenda: {
    type: DataTypes.TEXT
  },
  minutes: {
    type: DataTypes.TEXT
  },
  decision: {
    type: DataTypes.TEXT
  },
  nextHearingDate: {
    type: DataTypes.DATE
  },
  postponementReason: {
    type: DataTypes.TEXT
  },
  documents: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  witnesses: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  evidence: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  notes: {
    type: DataTypes.TEXT
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reminderSentAt: {
    type: DataTypes.DATE
  }
}, {
  sequelize,
  modelName: 'Hearing',
  tableName: 'hearings',
  indexes: [
    {
      fields: ['caseId']
    },
    {
      fields: ['hearingDate']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Hearing;