const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sensor = sequelize.define('Sensor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  stationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'stations',
      key: 'id'
    }
  },
  serialNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('pm25', 'pm10', 'co', 'no2', 'so2', 'o3', 'temperature', 'humidity', 'pressure'),
    allowNull: false
  },
  manufacturer: {
    type: DataTypes.STRING
  },
  model: {
    type: DataTypes.STRING
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  calibrationDate: {
    type: DataTypes.DATE
  },
  nextCalibrationDate: {
    type: DataTypes.DATE
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'faulty'),
    defaultValue: 'active'
  },
  minValue: {
    type: DataTypes.FLOAT
  },
  maxValue: {
    type: DataTypes.FLOAT
  },
  accuracy: {
    type: DataTypes.FLOAT
  },
  lastReading: {
    type: DataTypes.FLOAT
  },
  lastReadingTime: {
    type: DataTypes.DATE
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
});

module.exports = Sensor;