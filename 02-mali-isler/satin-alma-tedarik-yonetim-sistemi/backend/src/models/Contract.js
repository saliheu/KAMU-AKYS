const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Contract = sequelize.define('Contract', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  contractNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  tenderId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  supplierId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  contractDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  contractAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.ENUM('TRY', 'USD', 'EUR'),
    defaultValue: 'TRY'
  },
  paymentMethod: {
    type: DataTypes.ENUM('pesin', 'vadeli', 'kismi'),
    allowNull: false
  },
  paymentTerms: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  performanceGuarantee: {
    type: DataTypes.DECIMAL(12, 2)
  },
  status: {
    type: DataTypes.ENUM(
      'taslak',
      'imza_bekliyor',
      'aktif',
      'askida',
      'tamamlandi',
      'feshedildi'
    ),
    defaultValue: 'taslak'
  },
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  specialTerms: {
    type: DataTypes.TEXT
  },
  penalties: {
    type: DataTypes.JSON,
    defaultValue: {
      delayPenalty: 0.003,
      maxPenalty: 0.30
    }
  },
  documents: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  signedBy: {
    type: DataTypes.JSON,
    defaultValue: {
      supplier: null,
      authority: null
    }
  }
});

module.exports = Contract;