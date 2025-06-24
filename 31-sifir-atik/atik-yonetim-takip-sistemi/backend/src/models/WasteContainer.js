const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WasteContainer = sequelize.define('WasteContainer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  wastePointId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('organik', 'kağıt', 'plastik', 'cam', 'metal', 'elektronik', 'tehlikeli', 'pil', 'yağ', 'diğer'),
    allowNull: false
  },
  capacity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Litre cinsinden kapasite'
  },
  currentFillLevel: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Doluluk yüzdesi'
  },
  qrCode: {
    type: DataTypes.STRING,
    unique: true
  },
  hasIoTSensor: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sensorId: {
    type: DataTypes.STRING
  },
  lastEmptiedAt: {
    type: DataTypes.DATE
  },
  maintenanceDate: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('aktif', 'dolu', 'bakımda', 'arızalı', 'pasif'),
    defaultValue: 'aktif'
  },
  color: {
    type: DataTypes.STRING,
    comment: 'Renk kodu (hex)'
  }
});

module.exports = WasteContainer;