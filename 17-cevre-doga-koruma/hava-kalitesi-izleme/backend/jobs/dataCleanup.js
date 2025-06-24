const { Measurement, Notification, Alert, Report } = require('../models');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

const cleanOldData = async () => {
  try {
    // Clean measurements older than 90 days
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);

    const deletedMeasurements = await Measurement.destroy({
      where: {
        timestamp: {
          [Op.lt]: threeMonthsAgo
        }
      }
    });

    logger.info(`Deleted ${deletedMeasurements} old measurements`);

    // Clean notifications older than 30 days
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    const deletedNotifications = await Notification.destroy({
      where: {
        createdAt: {
          [Op.lt]: oneMonthAgo
        },
        status: ['sent', 'failed']
      }
    });

    logger.info(`Deleted ${deletedNotifications} old notifications`);

    // Clean resolved alerts older than 60 days
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);

    const deletedAlerts = await Alert.destroy({
      where: {
        status: 'resolved',
        resolvedAt: {
          [Op.lt]: twoMonthsAgo
        }
      }
    });

    logger.info(`Deleted ${deletedAlerts} old resolved alerts`);

    // Clean old report files
    await cleanOldReportFiles();

  } catch (error) {
    logger.error('Error cleaning old data:', error);
  }
};

const cleanOldReportFiles = async () => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

    // Get old reports
    const oldReports = await Report.findAll({
      where: {
        createdAt: {
          [Op.lt]: sixMonthsAgo
        },
        status: 'completed'
      }
    });

    for (const report of oldReports) {
      if (report.filePath) {
        try {
          await fs.unlink(report.filePath);
          logger.info(`Deleted report file: ${report.filePath}`);
        } catch (err) {
          logger.error(`Error deleting report file ${report.filePath}:`, err);
        }
      }
    }

    // Delete report records
    const deletedReports = await Report.destroy({
      where: {
        createdAt: {
          [Op.lt]: sixMonthsAgo
        }
      }
    });

    logger.info(`Deleted ${deletedReports} old report records`);
  } catch (error) {
    logger.error('Error cleaning old report files:', error);
  }
};

module.exports = {
  cleanOldData
};