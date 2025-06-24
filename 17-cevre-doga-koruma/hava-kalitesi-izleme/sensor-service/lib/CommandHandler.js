const { logger } = require('../utils/logger');

class CommandHandler {
  constructor(sensorManager) {
    this.sensorManager = sensorManager;
    this.commandHandlers = {
      restart: this.handleRestart.bind(this),
      calibrate: this.handleCalibrate.bind(this),
      status: this.handleStatus.bind(this),
      test: this.handleTest.bind(this)
    };
  }

  async handleStationCommand(command) {
    const handler = this.commandHandlers[command.command];
    
    if (!handler) {
      logger.error(`Unknown station command: ${command.command}`);
      return;
    }

    try {
      await handler(command);
      logger.info(`Station command executed: ${command.command}`);
    } catch (error) {
      logger.error(`Error executing station command ${command.command}:`, error);
    }
  }

  async handleSensorCommand(sensorId, command) {
    const sensor = this.sensorManager.getSensor(sensorId);
    
    if (!sensor) {
      logger.error(`Sensor not found: ${sensorId}`);
      return;
    }

    try {
      switch (command.command) {
        case 'calibrate':
          await this.sensorManager.calibrateSensor(sensorId, command.parameters);
          break;
        
        case 'restart':
          await sensor.restart();
          break;
        
        case 'enable':
          sensor.enable();
          break;
        
        case 'disable':
          sensor.disable();
          break;
        
        default:
          logger.error(`Unknown sensor command: ${command.command}`);
      }
      
      logger.info(`Sensor command executed for ${sensorId}: ${command.command}`);
    } catch (error) {
      logger.error(`Error executing sensor command for ${sensorId}:`, error);
    }
  }

  async handleRestart(command) {
    logger.info('Restarting station...');
    
    // Graceful restart
    setTimeout(() => {
      process.exit(0); // Supervisor should restart the process
    }, 5000);
  }

  async handleCalibrate(command) {
    const { sensorTypes = [] } = command.parameters || {};
    
    logger.info('Starting calibration...');
    
    const sensors = this.sensorManager.getActiveSensors();
    
    for (const sensor of sensors) {
      if (sensorTypes.length === 0 || sensorTypes.includes(sensor.type)) {
        try {
          await sensor.calibrate(command.parameters);
          logger.info(`Calibrated sensor ${sensor.serialNumber}`);
        } catch (error) {
          logger.error(`Failed to calibrate sensor ${sensor.serialNumber}:`, error);
        }
      }
    }
  }

  async handleStatus(command) {
    const status = {
      station: {
        code: process.env.STATION_CODE,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      },
      sensors: this.sensorManager.getSensorStatuses()
    };

    logger.info('Status report:', status);
    
    // In a real implementation, this would send the status back via MQTT
    return status;
  }

  async handleTest(command) {
    logger.info('Running station test...');
    
    const testResults = {
      timestamp: new Date(),
      sensors: {}
    };

    const sensors = this.sensorManager.getActiveSensors();
    
    for (const sensor of sensors) {
      try {
        const testData = await sensor.test();
        testResults.sensors[sensor.serialNumber] = {
          status: 'ok',
          data: testData
        };
      } catch (error) {
        testResults.sensors[sensor.serialNumber] = {
          status: 'error',
          error: error.message
        };
      }
    }

    logger.info('Test results:', testResults);
    
    return testResults;
  }
}

module.exports = CommandHandler;