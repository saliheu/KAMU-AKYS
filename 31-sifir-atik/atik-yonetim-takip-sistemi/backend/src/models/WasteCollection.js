const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WasteCollection = sequelize.define('WasteCollection', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  institutionId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  collectionDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  collectorCompanyId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  vehiclePlate: {
    type: DataTypes.STRING
  },
  driverName: {
    type: DataTypes.STRING
  },
  wasteTypes: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Toplanan atık türleri ve miktarları'
  },
  totalWeight: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    comment: 'Toplam ağırlık (kg)'
  },
  receiptNumber: {
    type: DataTypes.STRING,
    unique: true
  },
  destinationType: {
    type: DataTypes.ENUM('geri_dönüşüm', 'bertaraf', 'enerji_geri_kazanım', 'depolama'),
    allowNull: false
  },
  destinationFacility: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('planlandı', 'toplandı', 'teslim_edildi', 'iptal'),
    defaultValue: 'planlandı'
  },
  documents: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  verifiedBy: {
    type: DataTypes.UUID
  },
  notes: {
    type: DataTypes.TEXT
  }
});

module.exports = WasteCollection;