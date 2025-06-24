const cron = require('node-cron');
const { logger } = require('../utils/logger');
const stationMonitor = require('./stationMonitor');
const dataAggregator = require('./dataAggregator');
const reportGenerator = require('./reportGenerator');
const dataCleanup = require('./dataCleanup');

const startCronJobs = () => {
  // Monitor station status every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    logger.info('Running station monitor job');
    await stationMonitor.checkStationStatus();
  });

  // Aggregate hourly data
  cron.schedule('0 * * * *', async () => {
    logger.info('Running hourly data aggregation');
    await dataAggregator.aggregateHourlyData();
  });

  // Generate daily reports at 6 AM
  cron.schedule('0 6 * * *', async () => {
    logger.info('Running daily report generation');
    await reportGenerator.generateDailyReports();
  });

  // Clean up old data weekly on Sunday at 2 AM
  cron.schedule('0 2 * * 0', async () => {
    logger.info('Running weekly data cleanup');
    await dataCleanup.cleanOldData();
  });

  // Check sensor calibration dates daily
  cron.schedule('0 8 * * *', async () => {
    logger.info('Checking sensor calibration dates');
    await stationMonitor.checkSensorCalibration();
  });

  logger.info('Cron jobs initialized');
};

module.exports = { startCronJobs };