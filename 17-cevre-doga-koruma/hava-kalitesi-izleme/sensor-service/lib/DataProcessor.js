const { logger } = require('../utils/logger');

class DataProcessor {
  constructor() {
    this.stats = {
      totalReadings: 0,
      validReadings: 0,
      invalidReadings: 0,
      lastProcessed: null
    };
    this.calibrationFactors = new Map();
  }

  process(sensor, rawData) {
    try {
      this.stats.totalReadings++;

      // Validate raw data
      if (!this.validateRawData(sensor, rawData)) {
        this.stats.invalidReadings++;
        logger.warn(`Invalid data from sensor ${sensor.serialNumber}:`, rawData);
        return null;
      }

      // Apply calibration
      const calibratedData = this.applyCalibration(sensor, rawData);

      // Apply quality checks
      if (!this.qualityCheck(sensor, calibratedData)) {
        this.stats.invalidReadings++;
        logger.warn(`Quality check failed for sensor ${sensor.serialNumber}`);
        return null;
      }

      // Format for transmission
      const processedData = {
        sensorId: sensor.serialNumber,
        timestamp: new Date().toISOString(),
        value: calibratedData.value,
        unit: sensor.unit,
        rawValue: rawData.value,
        quality: this.calculateQuality(sensor, calibratedData),
        metadata: {
          sensorType: sensor.type,
          processingVersion: '1.0'
        }
      };

      this.stats.validReadings++;
      this.stats.lastProcessed = new Date();

      return processedData;
    } catch (error) {
      logger.error(`Error processing data from sensor ${sensor.serialNumber}:`, error);
      this.stats.invalidReadings++;
      return null;
    }
  }

  validateRawData(sensor, rawData) {
    // Basic validation
    if (!rawData || typeof rawData.value === 'undefined') {
      return false;
    }

    // Check if value is numeric
    if (isNaN(rawData.value)) {
      return false;
    }

    // Check sensor-specific ranges
    const ranges = {
      pm25: { min: 0, max: 1000 },
      pm10: { min: 0, max: 2000 },
      co: { min: 0, max: 50 },
      no2: { min: 0, max: 400 },
      so2: { min: 0, max: 500 },
      o3: { min: 0, max: 300 },
      temperature: { min: -50, max: 60 },
      humidity: { min: 0, max: 100 },
      pressure: { min: 800, max: 1200 }
    };

    const range = ranges[sensor.type] || ranges[rawData.type];
    if (range) {
      return rawData.value >= range.min && rawData.value <= range.max;
    }

    return true;
  }

  applyCalibration(sensor, rawData) {
    const calibrationFactor = this.calibrationFactors.get(sensor.serialNumber) || 1.0;
    
    return {
      ...rawData,
      value: rawData.value * calibrationFactor
    };
  }

  qualityCheck(sensor, data) {
    // Check for sudden spikes
    if (sensor.lastReading !== null) {
      const change = Math.abs(data.value - sensor.lastReading);
      const maxChange = this.getMaxChange(sensor.type);
      
      if (change > maxChange) {
        logger.warn(`Sudden spike detected for sensor ${sensor.serialNumber}: ${change}`);
        return false;
      }
    }

    // Check for stuck values
    if (sensor.lastReadings && sensor.lastReadings.length > 5) {
      const last5 = sensor.lastReadings.slice(-5);
      const allSame = last5.every(v => v === data.value);
      
      if (allSame) {
        logger.warn(`Stuck value detected for sensor ${sensor.serialNumber}`);
        return false;
      }
    }

    return true;
  }

  getMaxChange(sensorType) {
    const maxChanges = {
      pm25: 50,
      pm10: 100,
      co: 5,
      no2: 50,
      so2: 50,
      o3: 30,
      temperature: 5,
      humidity: 20,
      pressure: 10
    };

    return maxChanges[sensorType] || 100;
  }

  calculateQuality(sensor, data) {
    // Simple quality score based on various factors
    let quality = 100;

    // Reduce quality for values near sensor limits
    const ranges = {
      pm25: { min: 0, max: 500 },
      pm10: { min: 0, max: 600 },
      co: { min: 0, max: 30 },
      no2: { min: 0, max: 200 },
      so2: { min: 0, max: 200 },
      o3: { min: 0, max: 200 }
    };

    const range = ranges[sensor.type];
    if (range) {
      if (data.value <= range.min * 1.1 || data.value >= range.max * 0.9) {
        quality -= 20;
      }
    }

    // Reduce quality if sensor hasn't been calibrated recently
    if (sensor.lastCalibration) {
      const daysSinceCalibration = (Date.now() - sensor.lastCalibration) / (1000 * 60 * 60 * 24);
      if (daysSinceCalibration > 180) {
        quality -= 10;
      }
    }

    // Reduce quality for high error rates
    if (sensor.errorRate > 0.1) {
      quality -= 15;
    }

    return Math.max(0, Math.min(100, quality));
  }

  updateCalibration(sensorId, factor) {
    this.calibrationFactors.set(sensorId, factor);
    logger.info(`Updated calibration factor for sensor ${sensorId}: ${factor}`);
  }

  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalReadings > 0 
        ? (this.stats.validReadings / this.stats.totalReadings * 100).toFixed(2) + '%'
        : '0%'
    };
  }
}

module.exports = DataProcessor;