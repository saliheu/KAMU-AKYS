const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Station = sequelize.define('Station', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('traffic', 'industrial', 'background', 'rural'),
    allowNull: false
  },
  location: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: false
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: -90,
      max: 90
    }
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: -180,
      max: 180
    }
  },
  altitude: {
    type: DataTypes.FLOAT
  },
  address: {
    type: DataTypes.STRING
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  district: {
    type: DataTypes.STRING
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  installationDate: {
    type: DataTypes.DATE
  },
  lastMaintenanceDate: {
    type: DataTypes.DATE
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  status: {
    type: DataTypes.ENUM('online', 'offline', 'maintenance', 'error'),
    defaultValue: 'offline'
  },
  lastDataReceived: {
    type: DataTypes.DATE
  }
}, {
  hooks: {
    beforeSave: (station) => {
      if (station.latitude && station.longitude) {
        station.location = {
          type: 'Point',
          coordinates: [station.longitude, station.latitude]
        };
      }
    }
  }
});

module.exports = Station;