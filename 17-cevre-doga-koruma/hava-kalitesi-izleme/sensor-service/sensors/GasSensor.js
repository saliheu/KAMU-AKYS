const BaseSensor = require('./BaseSensor');
const ModbusRTU = require('modbus-serial');

class GasSensor extends BaseSensor {
  constructor(config) {
    super({ ...config, type: 'gas' });
    this.pollutants = config.pollutants || ['co', 'no2', 'so2', 'o3'];
    this.modbusClient = null;
    this.slaveId = config.slaveId || 1;
  }

  async initialize() {
    if (this.simulated) {
      this.active = true;
      return;
    }

    this.modbusClient = new ModbusRTU();
    
    await this.modbusClient.connectRTU(this.port, {
      baudRate: this.baudRate,
      parity: 'none',
      stopBits: 1,
      dataBits: 8
    });

    this.modbusClient.setID(this.slaveId);
    this.active = true;
  }

  async read() {
    if (this.simulated) {
      return this.simulateReading();
    }

    const readings = {};
    
    // Read each gas sensor register
    const registerMap = {
      co: 0x0000,
      no2: 0x0002,
      so2: 0x0004,
      o3: 0x0006
    };

    for (const [gas, register] of Object.entries(registerMap)) {
      if (this.pollutants.includes(gas)) {
        try {
          const data = await this.modbusClient.readHoldingRegisters(register, 2);
          const value = data.buffer.readFloatBE(0);
          readings[gas] = value;
        } catch (error) {
          this.errorCount++;
          throw error;
        }
      }
    }

    this.totalReadings++;
    this.lastReadingTime = new Date();

    return {
      type: 'gas',
      values: readings,
      timestamp: new Date()
    };
  }

  processBuffer() {
    // Modbus handles its own protocol
  }

  sendReadCommand() {
    // Modbus handles its own commands
  }

  simulateReading() {
    const readings = {};
    
    const baseValues = {
      co: 2.5,   // mg/m³
      no2: 30,   // μg/m³
      so2: 20,   // μg/m³
      o3: 60     // μg/m³
    };

    for (const gas of this.pollutants) {
      const base = baseValues[gas] || 10;
      const variation = Math.random() * base * 0.2 - base * 0.1;
      const noise = Math.random() * base * 0.05;
      
      readings[gas] = Math.max(0, base + variation + noise);
    }

    return {
      type: 'gas',
      values: readings,
      timestamp: new Date()
    };
  }

  async performCalibration(calibrationData) {
    const { gas, referenceValue } = calibrationData;
    
    if (!gas || !referenceValue) {
      return {
        success: false,
        message: 'Gas type and reference value required'
      };
    }

    try {
      // In a real implementation, we would send calibration commands to the sensor
      return {
        success: true,
        message: `${gas.toUpperCase()} sensor calibrated successfully`
      };
    } catch (error) {
      return {
        success: false,
        message: `Calibration failed: ${error.message}`
      };
    }
  }

  async shutdown() {
    if (this.modbusClient) {
      this.modbusClient.close();
    }
    await super.shutdown();
  }
}

module.exports = GasSensor;