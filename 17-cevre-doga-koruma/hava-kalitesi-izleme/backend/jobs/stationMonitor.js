const { Station, Sensor } = require('../models');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');
const alertService = require('../services/alertService');
const notificationService = require('../services/notificationService');

const checkStationStatus = async () => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    // Find stations that haven't received data recently
    const offlineStations = await Station.findAll({
      where: {
        isActive: true,
        status: 'online',
        lastDataReceived: {
          [Op.lt]: tenMinutesAgo
        }
      }
    });

    for (const station of offlineStations) {
      await station.update({ status: 'offline' });
      await alertService.createStationOfflineAlert(station);
      logger.warn(`Station ${station.name} marked as offline`);
    }

    // Check for stations that came back online
    const onlineStations = await Station.findAll({
      where: {
        isActive: true,
        status: 'offline',
        lastDataReceived: {
          [Op.gte]: tenMinutesAgo
        }
      }
    });

    for (const station of onlineStations) {
      await station.update({ status: 'online' });
      logger.info(`Station ${station.name} is back online`);
    }
  } catch (error) {
    logger.error('Error checking station status:', error);
  }
};

const checkSensorCalibration = async () => {
  try {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    const sensorsNeedingCalibration = await Sensor.findAll({
      where: {
        isActive: true,
        nextCalibrationDate: {
          [Op.lte]: thirtyDaysFromNow
        }
      },
      include: ['station']
    });

    for (const sensor of sensorsNeedingCalibration) {
      const daysUntilCalibration = Math.ceil(
        (sensor.nextCalibrationDate - Date.now()) / (24 * 60 * 60 * 1000)
      );

      if (daysUntilCalibration <= 0) {
        logger.warn(`Sensor ${sensor.serialNumber} calibration is overdue`);
      } else {
        logger.info(`Sensor ${sensor.serialNumber} needs calibration in ${daysUntilCalibration} days`);
      }

      // Send notification
      // await notificationService.sendCalibrationReminder(sensor);
    }
  } catch (error) {
    logger.error('Error checking sensor calibration:', error);
  }
};

module.exports = {
  checkStationStatus,
  checkSensorCalibration
};