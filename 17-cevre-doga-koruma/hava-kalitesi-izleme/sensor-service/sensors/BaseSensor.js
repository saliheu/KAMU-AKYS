const { SerialPort } = require('serialport');
const { logger } = require('../utils/logger');

class BaseSensor {
  constructor(config) {
    this.type = config.type;
    this.serialNumber = config.serialNumber;
    this.port = config.port;
    this.baudRate = config.baudRate || 9600;
    this.unit = config.unit;
    this.simulated = config.simulated || false;
    
    this.serialPort = null;
    this.active = false;
    this.lastReading = null;
    this.lastReadingTime = null;
    this.lastReadings = [];
    this.errorCount = 0;
    this.totalReadings = 0;
    this.lastCalibration = null;
    
    this.buffer = Buffer.alloc(0);
  }

  async initialize() {
    if (this.simulated) {
      logger.info(`Initialized simulated sensor: ${this.serialNumber}`);
      this.active = true;
      return;
    }

    return new Promise((resolve, reject) => {
      this.serialPort = new SerialPort({
        path: this.port,
        baudRate: this.baudRate,
        autoOpen: false
      });

      this.serialPort.on('data', (data) => {
        this.buffer = Buffer.concat([this.buffer, data]);
        this.processBuffer();
      });

      this.serialPort.on('error', (err) => {
        logger.error(`Sensor ${this.serialNumber} error:`, err);
        this.errorCount++;
      });

      this.serialPort.open((err) => {
        if (err) {
          logger.error(`Failed to open sensor ${this.serialNumber}:`, err);
          reject(err);
        } else {
          logger.info(`Opened sensor ${this.serialNumber} on ${this.port}`);
          this.active = true;
          resolve();
        }
      });
    });
  }

  async read() {
    if (this.simulated) {
      return this.simulateReading();
    }

    if (!this.active || !this.serialPort || !this.serialPort.isOpen) {
      throw new Error('Sensor not active or port not open');
    }

    // Send read command (sensor-specific)
    await this.sendReadCommand();

    // Wait for response
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Sensor read timeout'));
      }, 5000);

      this.once('data', (data) => {
        clearTimeout(timeout);
        this.totalReadings++;
        this.lastReading = data.value;
        this.lastReadingTime = new Date();
        this.updateHistory(data.value);
        resolve(data);
      });
    });
  }

  processBuffer() {
    // Override in subclasses to implement sensor-specific protocol
    throw new Error('processBuffer must be implemented by subclass');
  }

  sendReadCommand() {
    // Override in subclasses
    throw new Error('sendReadCommand must be implemented by subclass');
  }

  simulateReading() {
    // Override in subclasses for realistic simulation
    throw new Error('simulateReading must be implemented by subclass');
  }

  updateHistory(value) {
    this.lastReadings.push(value);
    if (this.lastReadings.length > 100) {
      this.lastReadings.shift();
    }
  }

  async calibrate(calibrationData) {
    logger.info(`Calibrating sensor ${this.serialNumber}...`);
    
    if (this.simulated) {
      this.lastCalibration = new Date();
      return { success: true, message: 'Simulated calibration complete' };
    }

    // Sensor-specific calibration
    const result = await this.performCalibration(calibrationData);
    
    if (result.success) {
      this.lastCalibration = new Date();
    }
    
    return result;
  }

  performCalibration(calibrationData) {
    // Override in subclasses
    throw new Error('performCalibration must be implemented by subclass');
  }

  async test() {
    try {
      const reading = await this.read();
      return {
        success: true,
        reading
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async restart() {
    logger.info(`Restarting sensor ${this.serialNumber}...`);
    
    if (!this.simulated) {
      await this.shutdown();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await this.initialize();
    }
    
    this.errorCount = 0;
  }

  enable() {
    this.active = true;
    logger.info(`Enabled sensor ${this.serialNumber}`);
  }

  disable() {
    this.active = false;
    logger.info(`Disabled sensor ${this.serialNumber}`);
  }

  isActive() {
    return this.active;
  }

  getStatus() {
    if (!this.active) return 'inactive';
    if (this.errorCount > 10) return 'error';
    if (this.errorRate > 0.2) return 'warning';
    return 'active';
  }

  get errorRate() {
    return this.totalReadings > 0 ? this.errorCount / this.totalReadings : 0;
  }

  async shutdown() {
    if (this.serialPort && this.serialPort.isOpen) {
      return new Promise((resolve) => {
        this.serialPort.close((err) => {
          if (err) {
            logger.error(`Error closing sensor ${this.serialNumber}:`, err);
          }
          resolve();
        });
      });
    }
    
    this.active = false;
  }
}

module.exports = BaseSensor;