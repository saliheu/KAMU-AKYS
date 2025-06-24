const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const { logger } = require('../utils/logger');

let influxDB;
let writeApi;
let queryApi;

const connectInflux = async () => {
  try {
    influxDB = new InfluxDB({
      url: process.env.INFLUX_URL || 'http://localhost:8086',
      token: process.env.INFLUX_TOKEN
    });

    const org = process.env.INFLUX_ORG || 'air-quality';
    const bucket = process.env.INFLUX_BUCKET || 'sensor-data';

    writeApi = influxDB.getWriteApi(org, bucket, 'ns');
    queryApi = influxDB.getQueryApi(org);

    // Test connection
    await queryApi.queryRows('from(bucket: "sensor-data") |> range(start: -1m) |> limit(n: 1)', {
      next: () => {},
      error: (error) => {
        logger.error('InfluxDB query test failed:', error);
      },
      complete: () => {
        logger.info('InfluxDB connection test successful');
      }
    });
  } catch (error) {
    logger.error('InfluxDB connection error:', error);
    throw error;
  }
};

const writeMeasurement = async (measurement) => {
  const point = new Point('air_quality')
    .tag('station_id', measurement.stationId)
    .tag('sensor_id', measurement.sensorId)
    .floatField('pm25', measurement.pm25)
    .floatField('pm10', measurement.pm10)
    .floatField('co', measurement.co)
    .floatField('no2', measurement.no2)
    .floatField('so2', measurement.so2)
    .floatField('o3', measurement.o3)
    .floatField('temperature', measurement.temperature)
    .floatField('humidity', measurement.humidity)
    .floatField('pressure', measurement.pressure)
    .floatField('aqi', measurement.aqi)
    .timestamp(new Date(measurement.timestamp));

  writeApi.writePoint(point);
  await writeApi.flush();
};

const queryMeasurements = async (stationId, timeRange = '24h') => {
  const query = `
    from(bucket: "${process.env.INFLUX_BUCKET || 'sensor-data'}")
    |> range(start: -${timeRange})
    |> filter(fn: (r) => r.station_id == "${stationId}")
    |> filter(fn: (r) => r._measurement == "air_quality")
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
  `;

  const data = [];
  await queryApi.queryRows(query, {
    next: (row, tableMeta) => {
      const record = tableMeta.toObject(row);
      data.push(record);
    },
    error: (error) => {
      logger.error('InfluxDB query error:', error);
      throw error;
    },
    complete: () => {
      logger.debug(`Retrieved ${data.length} measurements for station ${stationId}`);
    }
  });

  return data;
};

module.exports = { connectInflux, writeMeasurement, queryMeasurements };