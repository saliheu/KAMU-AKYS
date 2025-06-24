const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Institution = sequelize.define('Institution', {
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
      'government',
      'municipality', 
      'ngo',
      'military',
      'healthcare',
      'education',
      'private',
      'international'
    ),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  parentInstitutionId: {
    type: DataTypes.UUID,
    references: {
      model: 'Institutions',
      key: 'id'
    }
  },
  contactInfo: {
    type: DataTypes.JSONB,
    defaultValue: {
      phone: [],
      email: [],
      address: {}
    }
  },
  location: {
    type: DataTypes.GEOGRAPHY('POINT', 4326)
  },
  address: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  capacity: {
    type: DataTypes.JSONB,
    defaultValue: {
      personnel: 0,
      vehicles: 0,
      equipment: {}
    }
  },
  responsibleArea: {
    type: DataTypes.GEOGRAPHY('POLYGON', 4326)
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  certifications: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  capabilities: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  timestamps: true
});

// Self-referencing association for hierarchy
Institution.hasMany(Institution, { 
  as: 'subInstitutions', 
  foreignKey: 'parentInstitutionId' 
});
Institution.belongsTo(Institution, { 
  as: 'parentInstitution', 
  foreignKey: 'parentInstitutionId' 
});

module.exports = Institution;