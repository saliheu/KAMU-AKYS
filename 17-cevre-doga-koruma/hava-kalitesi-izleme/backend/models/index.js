const sequelize = require('../config/database');
const User = require('./User');
const Station = require('./Station');
const Sensor = require('./Sensor');
const Measurement = require('./Measurement');
const Alert = require('./Alert');
const AlertRule = require('./AlertRule');
const Notification = require('./Notification');
const Report = require('./Report');

// Associations
Station.hasMany(Sensor, { as: 'sensors', foreignKey: 'stationId' });
Sensor.belongsTo(Station, { as: 'station', foreignKey: 'stationId' });

Station.hasMany(Measurement, { as: 'measurements', foreignKey: 'stationId' });
Measurement.belongsTo(Station, { as: 'station', foreignKey: 'stationId' });

Sensor.hasMany(Measurement, { as: 'measurements', foreignKey: 'sensorId' });
Measurement.belongsTo(Sensor, { as: 'sensor', foreignKey: 'sensorId' });

Station.hasMany(Alert, { as: 'alerts', foreignKey: 'stationId' });
Alert.belongsTo(Station, { as: 'station', foreignKey: 'stationId' });

AlertRule.hasMany(Alert, { as: 'alerts', foreignKey: 'alertRuleId' });
Alert.belongsTo(AlertRule, { as: 'alertRule', foreignKey: 'alertRuleId' });

User.hasMany(Alert, { as: 'acknowledgedAlerts', foreignKey: 'acknowledgedBy' });
Alert.belongsTo(User, { as: 'acknowledger', foreignKey: 'acknowledgedBy' });

User.hasMany(Alert, { as: 'resolvedAlerts', foreignKey: 'resolvedBy' });
Alert.belongsTo(User, { as: 'resolver', foreignKey: 'resolvedBy' });

User.hasMany(Notification, { as: 'notifications', foreignKey: 'userId' });
Notification.belongsTo(User, { as: 'user', foreignKey: 'userId' });

User.hasMany(Report, { as: 'reports', foreignKey: 'createdBy' });
Report.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

module.exports = {
  sequelize,
  User,
  Station,
  Sensor,
  Measurement,
  Alert,
  AlertRule,
  Notification,
  Report
};