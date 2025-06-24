const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Case extends Model {}

Case.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  caseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  courtFileNumber: {
    type: DataTypes.STRING,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  type: {
    type: DataTypes.ENUM(
      'civil', 'criminal', 'administrative', 'labor', 
      'commercial', 'family', 'enforcement', 'bankruptcy',
      'intellectual_property', 'tax', 'other'
    ),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'pending', 'active', 'on_hold', 'closed', 
      'won', 'lost', 'settled', 'appealed', 'archived'
    ),
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  courtId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  opposingParty: {
    type: DataTypes.STRING
  },
  opposingLawyer: {
    type: DataTypes.STRING
  },
  opposingLawyerContact: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  claimAmount: {
    type: DataTypes.DECIMAL(15, 2)
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'TRY'
  },
  filingDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  closingDate: {
    type: DataTypes.DATE
  },
  nextHearingDate: {
    type: DataTypes.DATE
  },
  statuteOfLimitationsDate: {
    type: DataTypes.DATE
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  timeline: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  expenses: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  totalExpenses: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  isConfidential: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  accessList: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  }
}, {
  sequelize,
  modelName: 'Case',
  tableName: 'cases',
  indexes: [
    {
      fields: ['caseNumber']
    },
    {
      fields: ['courtFileNumber']
    },
    {
      fields: ['status']
    },
    {
      fields: ['type']
    },
    {
      fields: ['nextHearingDate']
    }
  ]
});

module.exports = Case;