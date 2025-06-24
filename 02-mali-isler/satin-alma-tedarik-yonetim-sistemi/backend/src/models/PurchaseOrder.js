const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  contractId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  supplierId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  orderDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  taxAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  grandTotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.ENUM('TRY', 'USD', 'EUR'),
    defaultValue: 'TRY'
  },
  status: {
    type: DataTypes.ENUM(
      'beklemede',
      'onaylandi',
      'kismen_teslim',
      'teslim_alindi',
      'iptal'
    ),
    defaultValue: 'beklemede'
  },
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  invoiceAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  approvedBy: {
    type: DataTypes.UUID
  },
  approvalDate: {
    type: DataTypes.DATE
  }
});

module.exports = PurchaseOrder;