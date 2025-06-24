const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Court extends Model {}

Court.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'civil_court', 'criminal_court', 'commercial_court',
      'labor_court', 'administrative_court', 'family_court',
      'enforcement_court', 'consumer_court', 'intellectual_property_court',
      'tax_court', 'peace_court', 'high_court', 'constitutional_court',
      'court_of_appeals', 'regional_court', 'other'
    ),
    allowNull: false
  },
  level: {
    type: DataTypes.ENUM('first_instance', 'appeal', 'supreme'),
    defaultValue: 'first_instance'
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  district: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING
  },
  fax: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  website: {
    type: DataTypes.STRING,
    validate: {
      isUrl: true
    }
  },
  workingHours: {
    type: DataTypes.JSONB,
    defaultValue: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
      saturday: null,
      sunday: null
    }
  },
  judges: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  prosecutors: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  clerks: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  notes: {
    type: DataTypes.TEXT
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'Court',
  tableName: 'courts',
  indexes: [
    {
      fields: ['city']
    },
    {
      fields: ['type']
    }
  ]
});

module.exports = Court;