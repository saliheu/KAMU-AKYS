const BaseSensor = require('./BaseSensor');

class WeatherSensor extends BaseSensor {
  constructor(config) {
    super({ ...config, type: 'weather' });
  }

  processBuffer() {
    // Process NMEA-like sentences for weather data
    const lines = this.buffer.toString().split('\n');
    
    for (const line of lines) {
      if (line.startsWith('$WEATHER,')) {
        const parts = line.split(',');
        if (parts.length >= 5) {
          this.emit('data', {
            type: 'weather',
            values: {
              temperature: parseFloat(parts[1]),
              humidity: parseFloat(parts[2]),
              pressure: parseFloat(parts[3]),
              windSpeed: parseFloat(parts[4]),
              windDirection: parseFloat(parts[5]) || 0
            },
            timestamp: new Date()
          });
        }
      }
    }

    // Keep only incomplete line in buffer
    const lastNewline = this.buffer.lastIndexOf('\n');
    if (lastNewline !== -1) {
      this.buffer = this.buffer.slice(lastNewline + 1);
    }
  }

  async sendReadCommand() {
    const command = Buffer.from('READ\r\n');
    return new Promise((resolve, reject) => {
      this.serialPort.write(command, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  simulateReading() {
    // Simulate realistic weather data
    const hour = new Date().getHours();
    
    // Temperature varies by time of day
    const baseTemp = 20;
    const tempVariation = 8 * Math.sin((hour - 6) * Math.PI / 12);
    const temperature = baseTemp + tempVariation + (Math.random() * 2 - 1);
    
    // Humidity inversely related to temperature
    const humidity = 60 - tempVariation * 2 + (Math.random() * 10 - 5);
    
    // Pressure with slow variation
    const pressure = 1013 + Math.sin(Date.now() / 3600000) * 10 + (Math.random() * 2 - 1);
    
    // Wind
    const windSpeed = Math.max(0, 5 + Math.random() * 10 - 5);
    const windDirection = (Date.now() / 1000) % 360;

    return {
      type: 'weather',
      values: {
        temperature: Math.round(temperature * 10) / 10,
        humidity: Math.round(humidity),
        pressure: Math.round(pressure * 10) / 10,
        windSpeed: Math.round(windSpeed * 10) / 10,
        windDirection: Math.round(windDirection)
      },
      timestamp: new Date()
    };
  }

  async performCalibration(calibrationData) {
    // Weather sensors typically don't need frequent calibration
    // But we can adjust offsets
    
    return {
      success: true,
      message: 'Weather sensor calibration not required'
    };
  }
}

module.exports = WeatherSensor;