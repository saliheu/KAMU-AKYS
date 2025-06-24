const BaseSensor = require('./BaseSensor');
const { logger } = require('../utils/logger');

class PM25Sensor extends BaseSensor {
  constructor(config) {
    super({ ...config, type: 'pm25', unit: 'μg/m³' });
    this.readCommand = Buffer.from([0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79]);
  }

  processBuffer() {
    // Look for complete frames in buffer
    while (this.buffer.length >= 9) {
      // Check for start byte
      if (this.buffer[0] !== 0xFF) {
        // Remove invalid byte and continue
        this.buffer = this.buffer.slice(1);
        continue;
      }

      // Check if we have a complete frame
      if (this.buffer[1] === 0x86 && this.buffer.length >= 9) {
        const frame = this.buffer.slice(0, 9);
        this.buffer = this.buffer.slice(9);

        // Verify checksum
        const checksum = this.calculateChecksum(frame.slice(0, 8));
        if (checksum === frame[8]) {
          // Extract PM2.5 value
          const pm25 = (frame[2] * 256 + frame[3]);
          
          this.emit('data', {
            type: 'pm25',
            value: pm25,
            unit: this.unit,
            timestamp: new Date()
          });
        } else {
          logger.warn(`Invalid checksum for sensor ${this.serialNumber}`);
          this.errorCount++;
        }
      } else {
        // Not enough data yet
        break;
      }
    }
  }

  calculateChecksum(data) {
    let sum = 0;
    for (let i = 1; i < 8; i++) {
      sum += data[i];
    }
    return (~sum + 1) & 0xFF;
  }

  async sendReadCommand() {
    return new Promise((resolve, reject) => {
      this.serialPort.write(this.readCommand, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  simulateReading() {
    // Simulate realistic PM2.5 values with some variation
    const baseValue = 15; // Base PM2.5 level
    const variation = Math.random() * 10 - 5; // ±5 variation
    const noise = Math.random() * 2 - 1; // ±1 noise
    
    // Add daily pattern (higher during day, lower at night)
    const hour = new Date().getHours();
    const dailyFactor = 1 + 0.3 * Math.sin((hour - 6) * Math.PI / 12);
    
    const value = Math.max(0, baseValue * dailyFactor + variation + noise);

    return {
      type: 'pm25',
      value: Math.round(value * 10) / 10,
      unit: this.unit,
      timestamp: new Date()
    };
  }

  async performCalibration(calibrationData) {
    const { referenceValue } = calibrationData;
    
    if (!referenceValue) {
      return {
        success: false,
        message: 'Reference value required for calibration'
      };
    }

    try {
      // Read current value
      const reading = await this.read();
      const currentValue = reading.value;
      
      // Calculate calibration factor
      const calibrationFactor = referenceValue / currentValue;
      
      // In a real sensor, we would write this to the sensor's EEPROM
      // For now, we'll store it in memory
      this.calibrationFactor = calibrationFactor;
      
      logger.info(`PM2.5 sensor ${this.serialNumber} calibrated. Factor: ${calibrationFactor}`);
      
      return {
        success: true,
        message: 'Calibration successful',
        calibrationFactor
      };
    } catch (error) {
      return {
        success: false,
        message: `Calibration failed: ${error.message}`
      };
    }
  }
}

module.exports = PM25Sensor;