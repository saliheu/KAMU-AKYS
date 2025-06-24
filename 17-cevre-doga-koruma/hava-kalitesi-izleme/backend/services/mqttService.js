const mqtt = require('mqtt');
const { logger } = require('../utils/logger');
const { Station, Sensor, Measurement } = require('../models');
const { writeMeasurement } = require('../config/influxdb');
const { getRedis } = require('../config/redis');
const alertService = require('./alertService');

let client;
let io;

const initMQTT = async (socketIO) => {
  io = socketIO;
  
  const options = {
    clientId: `air-quality-backend-${Date.now()}`,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  };

  if (process.env.MQTT_USERNAME) {
    options.username = process.env.MQTT_USERNAME;
    options.password = process.env.MQTT_PASSWORD;
  }

  client = mqtt.connect(process.env.MQTT_URL || 'mqtt://localhost:1883', options);

  client.on('connect', () => {
    logger.info('MQTT client connected');
    
    // Subscribe to sensor data topics
    client.subscribe('sensors/+/data', { qos: 1 });
    client.subscribe('stations/+/status', { qos: 1 });
    client.subscribe('sensors/+/status', { qos: 1 });
  });

  client.on('message', async (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      await handleMessage(topic, data);
    } catch (error) {
      logger.error('Error processing MQTT message:', error);
    }
  });

  client.on('error', (error) => {
    logger.error('MQTT error:', error);
  });

  client.on('reconnect', () => {
    logger.info('MQTT client reconnecting...');
  });

  client.on('offline', () => {
    logger.warn('MQTT client offline');
  });
};

const handleMessage = async (topic, data) => {
  const topicParts = topic.split('/');
  const entityType = topicParts[0];
  const entityId = topicParts[1];
  const messageType = topicParts[2];

  switch (entityType) {
    case 'sensors':
      if (messageType === 'data') {
        await handleSensorData(entityId, data);
      } else if (messageType === 'status') {
        await handleSensorStatus(entityId, data);
      }
      break;
    
    case 'stations':
      if (messageType === 'status') {
        await handleStationStatus(entityId, data);
      }
      break;
  }
};

const handleSensorData = async (sensorId, data) => {
  try {
    // Validate sensor exists
    const sensor = await Sensor.findOne({
      where: { serialNumber: sensorId },
      include: ['station']
    });

    if (!sensor || !sensor.isActive) {
      logger.warn(`Received data from unknown or inactive sensor: ${sensorId}`);
      return;
    }

    // Create measurement record
    const measurement = await Measurement.create({
      stationId: sensor.stationId,
      sensorId: sensor.id,
      timestamp: new Date(data.timestamp || Date.now()),
      [sensor.type]: data.value,
      raw: data
    });

    // Update sensor last reading
    await sensor.update({
      lastReading: data.value,
      lastReadingTime: measurement.timestamp
    });

    // Update station last data received
    await sensor.station.update({
      lastDataReceived: measurement.timestamp,
      status: 'online'
    });

    // Write to InfluxDB
    await writeMeasurement({
      stationId: sensor.stationId,
      sensorId: sensor.id,
      timestamp: measurement.timestamp,
      [sensor.type]: data.value,
      ...measurement.toJSON()
    });

    // Cache latest reading in Redis
    const redis = getRedis();
    await redis.setex(
      `measurement:latest:${sensor.stationId}`,
      300, // 5 minutes TTL
      JSON.stringify(measurement.toJSON())
    );

    // Emit real-time update via WebSocket
    io.to(`station-${sensor.stationId}`).emit('measurement', {
      stationId: sensor.stationId,
      sensorId: sensor.id,
      type: sensor.type,
      value: data.value,
      timestamp: measurement.timestamp,
      aqi: measurement.aqi,
      aqiCategory: measurement.aqiCategory
    });

    // Check for alerts
    await alertService.checkMeasurementAlerts(measurement);

    logger.debug(`Processed sensor data from ${sensorId}: ${data.value}`);
  } catch (error) {
    logger.error(`Error handling sensor data from ${sensorId}:`, error);
  }
};

const handleSensorStatus = async (sensorId, data) => {
  try {
    const sensor = await Sensor.findOne({
      where: { serialNumber: sensorId }
    });

    if (!sensor) {
      logger.warn(`Received status from unknown sensor: ${sensorId}`);
      return;
    }

    await sensor.update({
      status: data.status,
      metadata: {
        ...sensor.metadata,
        lastStatusUpdate: new Date(),
        statusDetails: data
      }
    });

    // Emit status update
    io.emit('sensor-status', {
      sensorId: sensor.id,
      status: data.status,
      timestamp: new Date()
    });

    logger.info(`Sensor ${sensorId} status updated to ${data.status}`);
  } catch (error) {
    logger.error(`Error handling sensor status from ${sensorId}:`, error);
  }
};

const handleStationStatus = async (stationId, data) => {
  try {
    const station = await Station.findOne({
      where: { code: stationId }
    });

    if (!station) {
      logger.warn(`Received status from unknown station: ${stationId}`);
      return;
    }

    const previousStatus = station.status;
    await station.update({
      status: data.status,
      metadata: {
        ...station.metadata,
        lastStatusUpdate: new Date(),
        statusDetails: data
      }
    });

    // Emit status update
    io.emit('station-status', {
      stationId: station.id,
      status: data.status,
      timestamp: new Date()
    });

    // Check for station offline alerts
    if (previousStatus === 'online' && data.status === 'offline') {
      await alertService.createStationOfflineAlert(station);
    }

    logger.info(`Station ${stationId} status updated to ${data.status}`);
  } catch (error) {
    logger.error(`Error handling station status from ${stationId}:`, error);
  }
};

const publishCommand = (topic, message) => {
  if (client && client.connected) {
    client.publish(topic, JSON.stringify(message), { qos: 1 });
  } else {
    logger.error('MQTT client not connected, cannot publish command');
  }
};

module.exports = {
  initMQTT,
  publishCommand
};