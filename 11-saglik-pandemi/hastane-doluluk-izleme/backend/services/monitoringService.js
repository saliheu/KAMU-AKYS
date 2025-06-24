const cron = require('node-cron');
const { Op } = require('sequelize');
const { HospitalDepartment, Alert, AlertRule, Hospital } = require('../models');
const { broadcast } = require('../websocket');
const { logger } = require('../utils/logger');

const checkAlertRules = async () => {
  try {
    const activeRules = await AlertRule.findAll({
      where: { isActive: true }
    });

    for (const rule of activeRules) {
      await processAlertRule(rule);
    }
  } catch (error) {
    logger.error('Error checking alert rules:', error);
  }
};

const processAlertRule = async (rule) => {
  const departments = await HospitalDepartment.findAll({
    include: [
      { model: Hospital, as: 'hospital' },
      { model: Department, as: 'department' }
    ]
  });

  for (const dept of departments) {
    const shouldAlert = await evaluateRule(rule, dept);
    
    if (shouldAlert) {
      await createAlert(rule, dept);
    }
  }
};

const evaluateRule = async (rule, department) => {
  let currentValue;
  
  switch (rule.metric) {
    case 'occupancy_rate':
      currentValue = department.getOccupancyRate();
      break;
    case 'available_beds':
      currentValue = department.availableBeds;
      break;
    case 'ventilator_usage':
      if (department.ventilatorTotal > 0) {
        currentValue = (department.ventilatorOccupied / department.ventilatorTotal) * 100;
      }
      break;
    default:
      return false;
  }

  switch (rule.condition) {
    case 'greater_than':
      return currentValue > rule.threshold;
    case 'less_than':
      return currentValue < rule.threshold;
    case 'equals':
      return currentValue === rule.threshold;
    default:
      return false;
  }
};

const createAlert = async (rule, department) => {
  // Check for existing active alerts to avoid duplicates
  const existingAlert = await Alert.findOne({
    where: {
      hospitalId: department.hospitalId,
      departmentId: department.departmentId,
      alertRuleId: rule.id,
      status: 'active',
      createdAt: {
        [Op.gte]: new Date(Date.now() - rule.cooldownMinutes * 60 * 1000)
      }
    }
  });

  if (existingAlert) {
    return; // Alert already exists within cooldown period
  }

  const alert = await Alert.create({
    hospitalId: department.hospitalId,
    departmentId: department.departmentId,
    alertRuleId: rule.id,
    type: rule.severity,
    title: `${rule.name} - ${department.hospital.name}`,
    message: `${rule.metric} threshold exceeded in ${department.department.name}`,
    metric: rule.metric,
    currentValue: department.getOccupancyRate(),
    thresholdValue: rule.threshold
  });

  // Broadcast alert via WebSocket
  broadcast('new_alert', {
    alert,
    hospital: department.hospital,
    department: department.department
  }, [`hospital_${department.hospitalId}`]);

  logger.warn('Alert created:', {
    alertId: alert.id,
    hospital: department.hospital.name,
    department: department.department.name,
    rule: rule.name
  });
};

const updateOccupancyData = async () => {
  try {
    const hospitals = await Hospital.findAll({
      where: { 
        isActive: true,
        integrationEndpoint: { [Op.ne]: null }
      }
    });

    for (const hospital of hospitals) {
      // Here you would integrate with hospital APIs
      // For now, we'll skip this as it requires external integration
      logger.info(`Would update data for hospital: ${hospital.name}`);
    }
  } catch (error) {
    logger.error('Error updating occupancy data:', error);
  }
};

const startMonitoring = () => {
  // Check alert rules every 5 minutes
  cron.schedule('*/5 * * * *', checkAlertRules);
  
  // Update occupancy data every minute
  const monitoringInterval = process.env.MONITORING_INTERVAL || 60000;
  setInterval(updateOccupancyData, monitoringInterval);
  
  logger.info('Monitoring service started');
};

module.exports = {
  startMonitoring,
  checkAlertRules,
  updateOccupancyData
};