const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WastePoint = sequelize.define('WastePoint', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  institutionId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  floor: {
    type: DataTypes.STRING
  },
  coordinates: {
    type: DataTypes.JSON,
    validate: {
      isValidCoordinates(value) {
        if (value && (!value.latitude || !value.longitude)) {
          throw new Error('Geçersiz koordinat bilgisi');
        }
      }
    }
  },
  qrCode: {
    type: DataTypes.STRING,
    unique: true
  },
  containerTypes: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  responsibleUserId: {
    type: DataTypes.UUID
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notes: {
    type: DataTypes.TEXT
  }
});

module.exports = WastePoint;