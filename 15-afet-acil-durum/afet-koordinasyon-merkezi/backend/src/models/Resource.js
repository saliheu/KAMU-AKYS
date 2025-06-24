const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Resource = sequelize.define('Resource', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  institutionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Institutions',
      key: 'id'
    }
  },
  category: {
    type: DataTypes.ENUM(
      'personnel',
      'vehicle',
      'equipment',
      'medical',
      'food',
      'water',
      'shelter',
      'clothing',
      'fuel',
      'communication',
      'tool',
      'other'
    ),
    allowNull: false
  },
  subCategory: {
    type: DataTypes.STRING
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  availableQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: 'adet'
  },
  specifications: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  location: {
    type: DataTypes.GEOGRAPHY('POINT', 4326)
  },
  storageLocation: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM(
      'available',
      'in_use',
      'maintenance',
      'damaged',
      'depleted'
    ),
    defaultValue: 'available'
  },
  expiryDate: {
    type: DataTypes.DATE
  },
  lastInspectionDate: {
    type: DataTypes.DATE
  },
  condition: {
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor'),
    defaultValue: 'good'
  },
  certifications: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  contactPerson: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  deploymentTime: {
    type: DataTypes.INTEGER, // minutes
    defaultValue: 0
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['status']
    },
    {
      fields: ['institutionId']
    }
  ]
});

module.exports = Resource;