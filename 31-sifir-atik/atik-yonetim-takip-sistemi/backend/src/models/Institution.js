const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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
    type: DataTypes.ENUM('bakanlık', 'belediye', 'üniversite', 'hastane', 'okul', 'diğer'),
    allowNull: false
  },
  taxNumber: {
    type: DataTypes.STRING(11),
    unique: true
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
  responsiblePerson: {
    type: DataTypes.STRING
  },
  responsiblePhone: {
    type: DataTypes.STRING
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      wasteCategories: ['organik', 'kağıt', 'plastik', 'cam', 'metal', 'elektronik', 'tehlikeli', 'diğer'],
      collectionDays: [],
      workingHours: {
        start: '08:00',
        end: '17:00'
      }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  certificateNumber: {
    type: DataTypes.STRING
  },
  certificateDate: {
    type: DataTypes.DATE
  }
});

module.exports = Institution;