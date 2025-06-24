const { InfluxDB } = require('@influxdata/influxdb-client');

let influxDB;
let writeApi;
let queryApi;

const connectInfluxDB = async () => {
  try {
    influxDB = new InfluxDB({
      url: process.env.INFLUXDB_URL,
      token: process.env.INFLUXDB_TOKEN,
    });

    const org = process.env.INFLUXDB_ORG;
    const bucket = process.env.INFLUXDB_BUCKET;

    writeApi = influxDB.getWriteApi(org, bucket);
    queryApi = influxDB.getQueryApi(org);

    console.log('Connected to InfluxDB');
  } catch (error) {
    console.error('InfluxDB connection error:', error);
    throw error;
  }
};

const getWriteApi = () => writeApi;
const getQueryApi = () => queryApi;

module.exports = {
  connectInfluxDB,
  getWriteApi,
  getQueryApi
};