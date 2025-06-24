const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(process.env.DATABASE_URL || config.development.url, {
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Import models
const User = require('./User')(sequelize);
const Hospital = require('./Hospital')(sequelize);
const Department = require('./Department')(sequelize);
const HospitalDepartment = require('./HospitalDepartment')(sequelize);
const OccupancyRecord = require('./OccupancyRecord')(sequelize);
const Alert = require('./Alert')(sequelize);
const AlertRule = require('./AlertRule')(sequelize);
const AuditLog = require('./AuditLog')(sequelize);

// Define associations
// User - Hospital (many-to-many through user_hospitals)
User.belongsToMany(Hospital, { 
  through: 'user_hospitals',
  as: 'hospitals'
});
Hospital.belongsToMany(User, { 
  through: 'user_hospitals',
  as: 'users'
});

// Hospital - Department (many-to-many through HospitalDepartment)
Hospital.belongsToMany(Department, {
  through: HospitalDepartment,
  as: 'departments'
});
Department.belongsToMany(Hospital, {
  through: HospitalDepartment,
  as: 'hospitals'
});

// HospitalDepartment - OccupancyRecord (1:N)
HospitalDepartment.hasMany(OccupancyRecord, {
  foreignKey: 'hospitalDepartmentId',
  as: 'occupancyRecords'
});
OccupancyRecord.belongsTo(HospitalDepartment, {
  foreignKey: 'hospitalDepartmentId',
  as: 'hospitalDepartment'
});

// Hospital - Alert (1:N)
Hospital.hasMany(Alert, {
  foreignKey: 'hospitalId',
  as: 'alerts'
});
Alert.belongsTo(Hospital, {
  foreignKey: 'hospitalId',
  as: 'hospital'
});

// AlertRule - Alert (1:N)
AlertRule.hasMany(Alert, {
  foreignKey: 'alertRuleId',
  as: 'alerts'
});
Alert.belongsTo(AlertRule, {
  foreignKey: 'alertRuleId',
  as: 'alertRule'
});

// User - AuditLog (1:N)
User.hasMany(AuditLog, {
  foreignKey: 'userId',
  as: 'auditLogs'
});
AuditLog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  sequelize,
  User,
  Hospital,
  Department,
  HospitalDepartment,
  OccupancyRecord,
  Alert,
  AlertRule,
  AuditLog
};