#!/usr/bin/env node

require('dotenv').config();
const mqtt = require('mqtt');
const { v4: uuidv4 } = require('uuid');

// Simulator for testing without physical sensors
class SensorSimulator {
  constructor() {
    this.stationCode = process.env.STATION_CODE || `SIM-${uuidv4().slice(0, 8)}`;
    this.mqttClient = null;
    this.sensors = [
      { id: 'SIM-PM25-001', type: 'pm25' },
      { id: 'SIM-PM10-001', type: 'pm10' },
      { id: 'SIM-GAS-001', type: 'gas' },
      { id: 'SIM-WEATHER-001', type: 'weather' }
    ];
  }

  async start() {
    console.log(`Starting sensor simulator for station ${this.stationCode}`);
    
    // Connect to MQTT
    this.mqttClient = mqtt.connect(process.env.MQTT_URL || 'mqtt://localhost:1883');
    
    this.mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
      
      // Send initial station status
      this.sendStationStatus('online');
      
      // Start sending sensor data
      this.startDataGeneration();
    });

    this.mqttClient.on('error', (error) => {
      console.error('MQTT error:', error);
    });
  }

  startDataGeneration() {
    // Send data every 30 seconds for testing
    setInterval(() => {
      this.sensors.forEach(sensor => {
        this.sendSensorData(sensor);
      });
    }, 30000);

    // Send initial data
    this.sensors.forEach(sensor => {
      this.sendSensorData(sensor);
    });
  }

  sendSensorData(sensor) {
    let data;
    
    switch (sensor.type) {
      case 'pm25':
        data = {
          sensorId: sensor.id,
          timestamp: new Date().toISOString(),
          value: this.generatePM25Value(),
          unit: 'μg/m³'
        };
        break;
        
      case 'pm10':
        data = {
          sensorId: sensor.id,
          timestamp: new Date().toISOString(),
          value: this.generatePM10Value(),
          unit: 'μg/m³'
        };
        break;
        
      case 'gas':
        data = {
          sensorId: sensor.id,
          timestamp: new Date().toISOString(),
          values: {
            co: this.generateCOValue(),
            no2: this.generateNO2Value(),
            so2: this.generateSO2Value(),
            o3: this.generateO3Value()
          }
        };
        break;
        
      case 'weather':
        data = {
          sensorId: sensor.id,
          timestamp: new Date().toISOString(),
          values: {
            temperature: this.generateTemperature(),
            humidity: this.generateHumidity(),
            pressure: this.generatePressure(),
            windSpeed: this.generateWindSpeed(),
            windDirection: this.generateWindDirection()
          }
        };
        break;
    }

    const topic = `sensors/${sensor.id}/data`;
    this.mqttClient.publish(topic, JSON.stringify(data), { qos: 1 });
    console.log(`Sent ${sensor.type} data:`, data);
  }

  sendStationStatus(status) {
    const statusData = {
      status,
      timestamp: new Date().toISOString(),
      sensors: this.sensors.map(s => ({
        id: s.id,
        type: s.type,
        status: 'active'
      }))
    };

    const topic = `stations/${this.stationCode}/status`;
    this.mqttClient.publish(topic, JSON.stringify(statusData), { qos: 1 });
  }

  // Value generators with realistic patterns
  generatePM25Value() {
    const hour = new Date().getHours();
    const base = 15;
    const rushHourFactor = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 1.5 : 1;
    const nightFactor = hour >= 22 || hour <= 5 ? 0.7 : 1;
    
    return Math.round((base * rushHourFactor * nightFactor + Math.random() * 10) * 10) / 10;
  }

  generatePM10Value() {
    return Math.round(this.generatePM25Value() * 1.8 + Math.random() * 5);
  }

  generateCOValue() {
    const hour = new Date().getHours();
    const base = 2;
    const trafficFactor = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 2 : 1;
    
    return Math.round((base * trafficFactor + Math.random() * 0.5) * 10) / 10;
  }

  generateNO2Value() {
    return Math.round(20 + Math.random() * 40);
  }

  generateSO2Value() {
    return Math.round(10 + Math.random() * 20);
  }

  generateO3Value() {
    const hour = new Date().getHours();
    const base = 40;
    const sunlightFactor = hour >= 10 && hour <= 16 ? 1.5 : 0.8;
    
    return Math.round(base * sunlightFactor + Math.random() * 20);
  }

  generateTemperature() {
    const hour = new Date().getHours();
    const base = 20;
    const variation = 10 * Math.sin((hour - 6) * Math.PI / 12);
    
    return Math.round((base + variation + Math.random() * 2 - 1) * 10) / 10;
  }

  generateHumidity() {
    return Math.round(40 + Math.random() * 40);
  }

  generatePressure() {
    return Math.round((1008 + Math.random() * 10) * 10) / 10;
  }

  generateWindSpeed() {
    return Math.round(Math.random() * 15 * 10) / 10;
  }

  generateWindDirection() {
    return Math.round(Math.random() * 360);
  }
}

// Start simulator
const simulator = new SensorSimulator();
simulator.start();

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down simulator...');
  if (simulator.mqttClient) {
    simulator.sendStationStatus('offline');
    simulator.mqttClient.end();
  }
  process.exit(0);
});