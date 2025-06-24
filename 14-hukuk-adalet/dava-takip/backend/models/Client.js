const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Client extends Model {}

Client.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('individual', 'corporate'),
    allowNull: false
  },
  // Individual fields
  tcNo: {
    type: DataTypes.STRING(11),
    unique: true,
    validate: {
      len: [11, 11],
      isNumeric: true
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  surname: {
    type: DataTypes.STRING
  },
  // Corporate fields
  taxNo: {
    type: DataTypes.STRING,
    unique: true
  },
  companyName: {
    type: DataTypes.STRING
  },
  tradeRegistryNo: {
    type: DataTypes.STRING
  },
  // Common fields
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  alternativePhone: {
    type: DataTypes.STRING
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
    type: DataTypes.STRING
  },
  postalCode: {
    type: DataTypes.STRING
  },
  notes: {
    type: DataTypes.TEXT
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  documents: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  bankAccounts: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  contactPersons: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  sequelize,
  modelName: 'Client',
  tableName: 'clients',
  indexes: [
    {
      fields: ['tcNo']
    },
    {
      fields: ['taxNo']
    },
    {
      fields: ['email']
    }
  ]
});

module.exports = Client;