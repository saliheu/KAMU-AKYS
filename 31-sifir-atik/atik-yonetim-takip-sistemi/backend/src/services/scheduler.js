const cron = require('node-cron');
const { logger } = require('../utils/logger');
const { generateDailyReport, generateMonthlyReport } = require('./reportService');
const { checkContainerLevels } = require('./containerService');
const { sendReminderNotifications } = require('./notificationService');

const scheduleJobs = () => {
  // Daily report generation - every day at 23:00
  cron.schedule('0 23 * * *', async () => {
    logger.info('Running daily report generation job');
    try {
      await generateDailyReport();
    } catch (error) {
      logger.error('Daily report job failed:', error);
    }
  });

  // Monthly report generation - first day of month at 02:00
  cron.schedule('0 2 1 * *', async () => {
    logger.info('Running monthly report generation job');
    try {
      await generateMonthlyReport();
    } catch (error) {
      logger.error('Monthly report job failed:', error);
    }
  });

  // Check container levels - every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Checking container fill levels');
    try {
      await checkContainerLevels();
    } catch (error) {
      logger.error('Container check job failed:', error);
    }
  });

  // Send reminder notifications - every day at 09:00
  cron.schedule('0 9 * * *', async () => {
    logger.info('Sending reminder notifications');
    try {
      await sendReminderNotifications();
    } catch (error) {
      logger.error('Notification job failed:', error);
    }
  });

  logger.info('Scheduled jobs initialized');
};

module.exports = { scheduleJobs };