const BaseSensor = require('./BaseSensor');

class PM10Sensor extends BaseSensor {
  constructor(config) {
    super({ ...config, type: 'pm10', unit: 'μg/m³' });
  }

  processBuffer() {
    // Similar to PM2.5 but different protocol
    // This is a simplified example
    while (this.buffer.length >= 10) {
      if (this.buffer[0] === 0xAA && this.buffer[1] === 0xC0) {
        const frame = this.buffer.slice(0, 10);
        this.buffer = this.buffer.slice(10);

        const pm10 = (frame[3] * 256 + frame[2]) / 10;
        
        this.emit('data', {
          type: 'pm10',
          value: pm10,
          unit: this.unit,
          timestamp: new Date()
        });
      } else {
        this.buffer = this.buffer.slice(1);
      }
    }
  }

  async sendReadCommand() {
    const command = Buffer.from([0xAA, 0xB4, 0x06, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0xFF]);
    return new Promise((resolve, reject) => {
      this.serialPort.write(command, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  simulateReading() {
    // PM10 is typically higher than PM2.5
    const baseValue = 30;
    const variation = Math.random() * 20 - 10;
    const noise = Math.random() * 3 - 1.5;
    
    const hour = new Date().getHours();
    const dailyFactor = 1 + 0.4 * Math.sin((hour - 6) * Math.PI / 12);
    
    const value = Math.max(0, baseValue * dailyFactor + variation + noise);

    return {
      type: 'pm10',
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
      const reading = await this.read();
      const calibrationFactor = referenceValue / reading.value;
      
      this.calibrationFactor = calibrationFactor;
      
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

module.exports = PM10Sensor;