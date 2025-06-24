require('dotenv').config();
const mqtt = require('mqtt');
const { logger } = require('./utils/logger');
const SensorManager = require('./lib/SensorManager');
const DataProcessor = require('./lib/DataProcessor');
const CommandHandler = require('./lib/CommandHandler');

class SensorService {
  constructor() {
    this.mqttClient = null;
    this.sensorManager = new SensorManager();
    this.dataProcessor = new DataProcessor();
    this.commandHandler = new CommandHandler(this.sensorManager);
    this.config = {
      stationCode: process.env.STATION_CODE,
      mqttUrl: process.env.MQTT_URL || 'mqtt://localhost:1883',
      mqttOptions: {
        clientId: `sensor-service-${process.env.STATION_CODE}-${Date.now()}`,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000
      }
    };
  }

  async start() {
    try {
      logger.info('Starting sensor service...');
      
      // Connect to MQTT broker
      await this.connectMQTT();
      
      // Initialize sensors
      await this.sensorManager.initialize();
      
      // Start data collection
      this.startDataCollection();
      
      // Start status reporting
      this.startStatusReporting();
      
      logger.info('Sensor service started successfully');
    } catch (error) {
      logger.error('Failed to start sensor service:', error);
      process.exit(1);
    }
  }

  async connectMQTT() {
    return new Promise((resolve, reject) => {
      this.mqttClient = mqtt.connect(this.config.mqttUrl, this.config.mqttOptions);

      this.mqttClient.on('connect', () => {
        logger.info('Connected to MQTT broker');
        
        // Subscribe to command topics
        const commandTopic = `stations/${this.config.stationCode}/command`;
        const sensorCommandTopic = `sensors/+/command`;
        
        this.mqttClient.subscribe([commandTopic, sensorCommandTopic], (err) => {
          if (err) {
            logger.error('Failed to subscribe to command topics:', err);
            reject(err);
          } else {
            logger.info('Subscribed to command topics');
            resolve();
          }
        });
      });

      this.mqttClient.on('message', (topic, message) => {
        this.handleCommand(topic, message);
      });

      this.mqttClient.on('error', (error) => {
        logger.error('MQTT error:', error);
      });

      this.mqttClient.on('reconnect', () => {
        logger.info('Reconnecting to MQTT broker...');
      });
    });
  }

  startDataCollection() {
    // Collect data every minute
    setInterval(async () => {
      try {
        const sensors = this.sensorManager.getActiveSensors();
        
        for (const sensor of sensors) {
          try {
            // Read sensor data
            const rawData = await sensor.read();
            
            // Process and validate data
            const processedData = this.dataProcessor.process(sensor, rawData);
            
            if (processedData) {
              // Publish to MQTT
              const topic = `sensors/${sensor.serialNumber}/data`;
              this.mqttClient.publish(topic, JSON.stringify(processedData), { qos: 1 });
              
              logger.debug(`Published data from sensor ${sensor.serialNumber}: ${JSON.stringify(processedData)}`);
            }
          } catch (error) {
            logger.error(`Error reading sensor ${sensor.serialNumber}:`, error);
            
            // Report sensor error
            this.reportSensorStatus(sensor, 'error', error.message);
          }
        }
      } catch (error) {
        logger.error('Error in data collection:', error);
      }
    }, 60000); // 1 minute
  }

  startStatusReporting() {
    // Report station status every 5 minutes
    setInterval(() => {
      const status = {
        status: 'online',
        timestamp: new Date(),
        sensors: this.sensorManager.getSensorStatuses(),
        metadata: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          dataCollected: this.dataProcessor.getStats()
        }
      };

      const topic = `stations/${this.config.stationCode}/status`;
      this.mqttClient.publish(topic, JSON.stringify(status), { qos: 1 });
      
      logger.info('Station status reported');
    }, 300000); // 5 minutes

    // Report initial status
    setTimeout(() => {
      const topic = `stations/${this.config.stationCode}/status`;
      this.mqttClient.publish(topic, JSON.stringify({ status: 'online' }), { qos: 1 });
    }, 5000);
  }

  reportSensorStatus(sensor, status, error = null) {
    const statusData = {
      status,
      timestamp: new Date(),
      error
    };

    const topic = `sensors/${sensor.serialNumber}/status`;
    this.mqttClient.publish(topic, JSON.stringify(statusData), { qos: 1 });
  }

  async handleCommand(topic, message) {
    try {
      const command = JSON.parse(message.toString());
      logger.info(`Received command on ${topic}:`, command);

      const topicParts = topic.split('/');
      const entityType = topicParts[0];
      const entityId = topicParts[1];

      if (entityType === 'stations' && entityId === this.config.stationCode) {
        // Station command
        await this.commandHandler.handleStationCommand(command);
      } else if (entityType === 'sensors') {
        // Sensor command
        await this.commandHandler.handleSensorCommand(entityId, command);
      }
    } catch (error) {
      logger.error('Error handling command:', error);
    }
  }

  async stop() {
    logger.info('Stopping sensor service...');
    
    // Stop sensors
    await this.sensorManager.shutdown();
    
    // Disconnect from MQTT
    if (this.mqttClient) {
      this.mqttClient.end();
    }
    
    logger.info('Sensor service stopped');
  }
}

// Start the service
const service = new SensorService();

service.start().catch((error) => {
  logger.error('Failed to start service:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await service.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await service.stop();
  process.exit(0);
});