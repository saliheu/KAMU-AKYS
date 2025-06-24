const { logger } = require('../utils/logger');
const PM25Sensor = require('../sensors/PM25Sensor');
const PM10Sensor = require('../sensors/PM10Sensor');
const GasSensor = require('../sensors/GasSensor');
const WeatherSensor = require('../sensors/WeatherSensor');

class SensorManager {
  constructor() {
    this.sensors = new Map();
    this.sensorClasses = {
      pm25: PM25Sensor,
      pm10: PM10Sensor,
      gas: GasSensor,
      weather: WeatherSensor
    };
  }

  async initialize() {
    logger.info('Initializing sensors...');
    
    // Load sensor configuration
    const sensorConfig = this.loadSensorConfig();
    
    for (const config of sensorConfig) {
      try {
        const SensorClass = this.sensorClasses[config.type];
        if (!SensorClass) {
          logger.error(`Unknown sensor type: ${config.type}`);
          continue;
        }

        const sensor = new SensorClass(config);
        await sensor.initialize();
        
        this.sensors.set(sensor.serialNumber, sensor);
        logger.info(`Initialized sensor: ${sensor.serialNumber} (${config.type})`);
      } catch (error) {
        logger.error(`Failed to initialize sensor ${config.serialNumber}:`, error);
      }
    }

    logger.info(`Initialized ${this.sensors.size} sensors`);
  }

  loadSensorConfig() {
    // In production, this would load from a config file or database
    // For now, using environment variables
    const config = [];

    if (process.env.PM25_SENSOR_PORT) {
      config.push({
        type: 'pm25',
        serialNumber: process.env.PM25_SENSOR_SERIAL || 'PM25-001',
        port: process.env.PM25_SENSOR_PORT,
        baudRate: parseInt(process.env.PM25_SENSOR_BAUD || '9600'),
        unit: 'μg/m³'
      });
    }

    if (process.env.PM10_SENSOR_PORT) {
      config.push({
        type: 'pm10',
        serialNumber: process.env.PM10_SENSOR_SERIAL || 'PM10-001',
        port: process.env.PM10_SENSOR_PORT,
        baudRate: parseInt(process.env.PM10_SENSOR_BAUD || '9600'),
        unit: 'μg/m³'
      });
    }

    if (process.env.GAS_SENSOR_PORT) {
      config.push({
        type: 'gas',
        serialNumber: process.env.GAS_SENSOR_SERIAL || 'GAS-001',
        port: process.env.GAS_SENSOR_PORT,
        baudRate: parseInt(process.env.GAS_SENSOR_BAUD || '9600'),
        pollutants: ['co', 'no2', 'so2', 'o3']
      });
    }

    if (process.env.WEATHER_SENSOR_PORT) {
      config.push({
        type: 'weather',
        serialNumber: process.env.WEATHER_SENSOR_SERIAL || 'WEATHER-001',
        port: process.env.WEATHER_SENSOR_PORT,
        baudRate: parseInt(process.env.WEATHER_SENSOR_BAUD || '9600')
      });
    }

    // If no physical sensors configured, use simulated sensors
    if (config.length === 0) {
      logger.warn('No physical sensors configured, using simulated sensors');
      config.push(
        { type: 'pm25', serialNumber: 'SIM-PM25-001', simulated: true },
        { type: 'pm10', serialNumber: 'SIM-PM10-001', simulated: true },
        { type: 'gas', serialNumber: 'SIM-GAS-001', simulated: true },
        { type: 'weather', serialNumber: 'SIM-WEATHER-001', simulated: true }
      );
    }

    return config;
  }

  getActiveSensors() {
    return Array.from(this.sensors.values()).filter(sensor => sensor.isActive());
  }

  getSensor(serialNumber) {
    return this.sensors.get(serialNumber);
  }

  getSensorStatuses() {
    const statuses = {};
    
    for (const [serialNumber, sensor] of this.sensors) {
      statuses[serialNumber] = {
        type: sensor.type,
        status: sensor.getStatus(),
        lastReading: sensor.lastReading,
        lastReadingTime: sensor.lastReadingTime,
        errors: sensor.errorCount
      };
    }

    return statuses;
  }

  async calibrateSensor(serialNumber, calibrationData) {
    const sensor = this.sensors.get(serialNumber);
    if (!sensor) {
      throw new Error(`Sensor ${serialNumber} not found`);
    }

    await sensor.calibrate(calibrationData);
    logger.info(`Calibrated sensor ${serialNumber}`);
  }

  async shutdown() {
    logger.info('Shutting down sensors...');
    
    for (const sensor of this.sensors.values()) {
      try {
        await sensor.shutdown();
      } catch (error) {
        logger.error(`Error shutting down sensor ${sensor.serialNumber}:`, error);
      }
    }
    
    this.sensors.clear();
  }
}

module.exports = SensorManager;