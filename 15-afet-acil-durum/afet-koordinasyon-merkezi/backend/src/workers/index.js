const Queue = require('bull');
const logger = require('../utils/logger');
const notificationWorker = require('./notification.worker');
const reportWorker = require('./report.worker');
const dataAggregationWorker = require('./dataAggregation.worker');

const REDIS_URL = process.env.BULL_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379';

const queues = {
  notification: new Queue('notification', REDIS_URL),
  report: new Queue('report', REDIS_URL),
  dataAggregation: new Queue('dataAggregation', REDIS_URL)
};

const setupWorkers = async () => {
  try {
    // Notification worker
    queues.notification.process(10, notificationWorker.processNotification);
    
    // Report generation worker
    queues.report.process(5, reportWorker.generateReport);
    
    // Data aggregation worker
    queues.dataAggregation.process(3, dataAggregationWorker.aggregateData);

    // Error handling for all queues
    Object.entries(queues).forEach(([name, queue]) => {
      queue.on('error', (error) => {
        logger.error(`Queue ${name} error:`, error);
      });

      queue.on('completed', (job) => {
        logger.info(`Job ${job.id} completed in queue ${name}`);
      });

      queue.on('failed', (job, err) => {
        logger.error(`Job ${job.id} failed in queue ${name}:`, err);
      });
    });

    logger.info('Background workers initialized successfully');
  } catch (error) {
    logger.error('Failed to setup workers:', error);
    throw error;
  }
};

// Export queue methods
const addNotificationJob = (data, options = {}) => {
  return queues.notification.add('send-notification', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    ...options
  });
};

const addReportJob = (data, options = {}) => {
  return queues.report.add('generate-report', data, {
    attempts: 2,
    timeout: 300000, // 5 minutes
    ...options
  });
};

const addDataAggregationJob = (data, options = {}) => {
  return queues.dataAggregation.add('aggregate-data', data, {
    attempts: 3,
    ...options
  });
};

module.exports = {
  setupWorkers,
  queues,
  addNotificationJob,
  addReportJob,
  addDataAggregationJob
};