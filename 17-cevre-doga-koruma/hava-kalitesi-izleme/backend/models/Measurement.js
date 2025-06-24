const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Measurement = sequelize.define('Measurement', {
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
  sensorId: {
    type: DataTypes.UUID,
    references: {
      model: 'sensors',
      key: 'id'
    }
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  pm25: {
    type: DataTypes.FLOAT,
    validate: { min: 0 }
  },
  pm10: {
    type: DataTypes.FLOAT,
    validate: { min: 0 }
  },
  co: {
    type: DataTypes.FLOAT,
    validate: { min: 0 }
  },
  no2: {
    type: DataTypes.FLOAT,
    validate: { min: 0 }
  },
  so2: {
    type: DataTypes.FLOAT,
    validate: { min: 0 }
  },
  o3: {
    type: DataTypes.FLOAT,
    validate: { min: 0 }
  },
  temperature: {
    type: DataTypes.FLOAT,
    validate: { min: -50, max: 60 }
  },
  humidity: {
    type: DataTypes.FLOAT,
    validate: { min: 0, max: 100 }
  },
  pressure: {
    type: DataTypes.FLOAT,
    validate: { min: 800, max: 1200 }
  },
  windSpeed: {
    type: DataTypes.FLOAT,
    validate: { min: 0 }
  },
  windDirection: {
    type: DataTypes.FLOAT,
    validate: { min: 0, max: 360 }
  },
  aqi: {
    type: DataTypes.INTEGER,
    validate: { min: 0, max: 500 }
  },
  aqiCategory: {
    type: DataTypes.ENUM('good', 'moderate', 'unhealthy_sensitive', 'unhealthy', 'very_unhealthy', 'hazardous')
  },
  dominantPollutant: {
    type: DataTypes.STRING
  },
  isValidated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  validationStatus: {
    type: DataTypes.ENUM('pending', 'validated', 'rejected'),
    defaultValue: 'pending'
  },
  raw: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  indexes: [
    {
      fields: ['stationId', 'timestamp']
    },
    {
      fields: ['timestamp']
    },
    {
      fields: ['aqi']
    }
  ]
});

// Calculate AQI before saving
Measurement.beforeSave(async (measurement) => {
  if (measurement.pm25 !== null || measurement.pm10 !== null) {
    measurement.aqi = calculateAQI(measurement);
    measurement.aqiCategory = getAQICategory(measurement.aqi);
    measurement.dominantPollutant = getDominantPollutant(measurement);
  }
});

function calculateAQI(measurement) {
  const pollutants = [
    { name: 'pm25', value: measurement.pm25, breakpoints: [
      { low: 0, high: 12, aqiLow: 0, aqiHigh: 50 },
      { low: 12.1, high: 35.4, aqiLow: 51, aqiHigh: 100 },
      { low: 35.5, high: 55.4, aqiLow: 101, aqiHigh: 150 },
      { low: 55.5, high: 150.4, aqiLow: 151, aqiHigh: 200 },
      { low: 150.5, high: 250.4, aqiLow: 201, aqiHigh: 300 },
      { low: 250.5, high: 350.4, aqiLow: 301, aqiHigh: 400 },
      { low: 350.5, high: 500.4, aqiLow: 401, aqiHigh: 500 }
    ]},
    { name: 'pm10', value: measurement.pm10, breakpoints: [
      { low: 0, high: 54, aqiLow: 0, aqiHigh: 50 },
      { low: 55, high: 154, aqiLow: 51, aqiHigh: 100 },
      { low: 155, high: 254, aqiLow: 101, aqiHigh: 150 },
      { low: 255, high: 354, aqiLow: 151, aqiHigh: 200 },
      { low: 355, high: 424, aqiLow: 201, aqiHigh: 300 },
      { low: 425, high: 504, aqiLow: 301, aqiHigh: 400 },
      { low: 505, high: 604, aqiLow: 401, aqiHigh: 500 }
    ]}
  ];

  let maxAQI = 0;
  
  pollutants.forEach(pollutant => {
    if (pollutant.value !== null) {
      const bp = pollutant.breakpoints.find(b => 
        pollutant.value >= b.low && pollutant.value <= b.high
      );
      
      if (bp) {
        const aqi = ((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) * 
                   (pollutant.value - bp.low) + bp.aqiLow;
        maxAQI = Math.max(maxAQI, Math.round(aqi));
      }
    }
  });

  return maxAQI;
}

function getAQICategory(aqi) {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy_sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very_unhealthy';
  return 'hazardous';
}

function getDominantPollutant(measurement) {
  const pollutants = {
    'PM2.5': measurement.pm25,
    'PM10': measurement.pm10,
    'CO': measurement.co,
    'NO2': measurement.no2,
    'SO2': measurement.so2,
    'O3': measurement.o3
  };

  let dominant = null;
  let maxValue = 0;

  Object.entries(pollutants).forEach(([name, value]) => {
    if (value && value > maxValue) {
      maxValue = value;
      dominant = name;
    }
  });

  return dominant;
}

module.exports = Measurement;