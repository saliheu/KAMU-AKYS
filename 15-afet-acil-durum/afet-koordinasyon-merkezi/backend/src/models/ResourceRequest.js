const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ResourceRequest = sequelize.define('ResourceRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  disasterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Disasters',
      key: 'id'
    }
  },
  requesterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Institutions',
      key: 'id'
    }
  },
  providerId: {
    type: DataTypes.UUID,
    references: {
      model: 'Institutions',
      key: 'id'
    }
  },
  requestedById: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  approvedById: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'approved',
      'rejected',
      'in_transit',
      'delivered',
      'cancelled'
    ),
    defaultValue: 'pending'
  },
  resources: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
    // Format: [{ category, name, requestedQuantity, approvedQuantity, deliveredQuantity, unit }]
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  deliveryLocation: {
    type: DataTypes.GEOGRAPHY('POINT', 4326)
  },
  deliveryAddress: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  requestDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  requiredByDate: {
    type: DataTypes.DATE
  },
  approvalDate: {
    type: DataTypes.DATE
  },
  deliveryDate: {
    type: DataTypes.DATE
  },
  actualDeliveryDate: {
    type: DataTypes.DATE
  },
  notes: {
    type: DataTypes.TEXT
  },
  rejectionReason: {
    type: DataTypes.TEXT
  },
  transportDetails: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['disasterId']
    },
    {
      fields: ['requesterId']
    }
  ]
});

module.exports = ResourceRequest;