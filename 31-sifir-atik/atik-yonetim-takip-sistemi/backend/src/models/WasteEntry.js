const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WasteEntry = sequelize.define('WasteEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  institutionId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  wastePointId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  containerId: {
    type: DataTypes.UUID
  },
  wasteType: {
    type: DataTypes.ENUM('organik', 'kağıt', 'plastik', 'cam', 'metal', 'elektronik', 'tehlikeli', 'pil', 'yağ', 'tıbbi', 'diğer'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    comment: 'Kilogram cinsinden miktar'
  },
  unit: {
    type: DataTypes.ENUM('kg', 'litre', 'adet'),
    defaultValue: 'kg'
  },
  entryType: {
    type: DataTypes.ENUM('manual', 'qr', 'sensor', 'bulk'),
    defaultValue: 'manual'
  },
  enteredBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  verifiedBy: {
    type: DataTypes.UUID
  },
  verifiedAt: {
    type: DataTypes.DATE
  },
  collectionBatchId: {
    type: DataTypes.UUID
  },
  photos: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  notes: {
    type: DataTypes.TEXT
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
});

module.exports = WasteEntry;