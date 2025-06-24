const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PurchaseRequest = sequelize.define('PurchaseRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  requestNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  requestType: {
    type: DataTypes.ENUM('mal_alimi', 'hizmet_alimi', 'yapim_isi'),
    allowNull: false
  },
  urgency: {
    type: DataTypes.ENUM('normal', 'acil', 'cok_acil'),
    defaultValue: 'normal'
  },
  estimatedBudget: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.ENUM('TRY', 'USD', 'EUR'),
    defaultValue: 'TRY'
  },
  justification: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  technicalSpecs: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM(
      'taslak',
      'onay_bekliyor',
      'onaylandi',
      'reddedildi',
      'ihale_asamasinda',
      'tamamlandi',
      'iptal'
    ),
    defaultValue: 'taslak'
  },
  approvals: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  requesterId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  approvedBy: {
    type: DataTypes.UUID
  },
  approvalDate: {
    type: DataTypes.DATE
  },
  rejectionReason: {
    type: DataTypes.TEXT
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: []
  }
});

module.exports = PurchaseRequest;