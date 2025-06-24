const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Bid = sequelize.define('Bid', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenderId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  supplierId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  bidAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.ENUM('TRY', 'USD', 'EUR'),
    defaultValue: 'TRY'
  },
  deliveryTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Teslim süresi (gün)'
  },
  paymentTerms: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  technicalScore: {
    type: DataTypes.DECIMAL(5, 2)
  },
  priceScore: {
    type: DataTypes.DECIMAL(5, 2)
  },
  totalScore: {
    type: DataTypes.DECIMAL(5, 2)
  },
  status: {
    type: DataTypes.ENUM(
      'teslim_edildi',
      'degerlendiriliyor',
      'kabul',
      'red',
      'geri_cekildi'
    ),
    defaultValue: 'teslim_edildi'
  },
  submissionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  documents: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  notes: {
    type: DataTypes.TEXT
  },
  isWinner: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Bid;