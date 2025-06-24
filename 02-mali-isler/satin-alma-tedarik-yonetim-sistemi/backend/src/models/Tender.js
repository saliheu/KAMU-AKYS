const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tender = sequelize.define('Tender', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenderNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  purchaseRequestId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  tenderMethod: {
    type: DataTypes.ENUM(
      'acik_ihale',
      'kapali_zarf',
      'pazarlik_usulu',
      'dogrudan_temin'
    ),
    allowNull: false
  },
  announcementDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  deadlineDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  openingDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  specifications: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  estimatedValue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  guaranteeAmount: {
    type: DataTypes.DECIMAL(12, 2)
  },
  guaranteeRate: {
    type: DataTypes.DECIMAL(5, 2)
  },
  status: {
    type: DataTypes.ENUM(
      'hazirlaniyor',
      'ilan_edildi',
      'teklif_toplama',
      'degerlendirme',
      'sonuclandi',
      'iptal'
    ),
    defaultValue: 'hazirlaniyor'
  },
  participants: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  documents: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

module.exports = Tender;