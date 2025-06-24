const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RecyclingCompany = sequelize.define('RecyclingCompany', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  taxNumber: {
    type: DataTypes.STRING(11),
    unique: true,
    allowNull: false
  },
  licenseNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  licenseExpiry: {
    type: DataTypes.DATE,
    allowNull: false
  },
  authorizedWasteTypes: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  district: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  contactPerson: {
    type: DataTypes.STRING
  },
  contactPhone: {
    type: DataTypes.STRING
  },
  capacity: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: 'Atık türüne göre günlük kapasite (ton)'
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  documents: {
    type: DataTypes.JSON,
    defaultValue: []
  }
});

module.exports = RecyclingCompany;