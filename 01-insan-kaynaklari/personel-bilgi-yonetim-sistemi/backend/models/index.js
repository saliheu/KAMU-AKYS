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
const Personnel = require('./Personnel')(sequelize);
const Department = require('./Department')(sequelize);
const Position = require('./Position')(sequelize);
const Leave = require('./Leave')(sequelize);
const LeaveType = require('./LeaveType')(sequelize);
const Document = require('./Document')(sequelize);
const Education = require('./Education')(sequelize);
const Experience = require('./Experience')(sequelize);
const EmergencyContact = require('./EmergencyContact')(sequelize);

// Define associations
// User - Personnel (1:1)
User.hasOne(Personnel, { foreignKey: 'userId', as: 'personnel' });
Personnel.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Department - Personnel (1:N)
Department.hasMany(Personnel, { foreignKey: 'departmentId', as: 'personnel' });
Personnel.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

// Position - Personnel (1:N)
Position.hasMany(Personnel, { foreignKey: 'positionId', as: 'personnel' });
Personnel.belongsTo(Position, { foreignKey: 'positionId', as: 'position' });

// Personnel - Leave (1:N)
Personnel.hasMany(Leave, { foreignKey: 'personnelId', as: 'leaves' });
Leave.belongsTo(Personnel, { foreignKey: 'personnelId', as: 'personnel' });

// LeaveType - Leave (1:N)
LeaveType.hasMany(Leave, { foreignKey: 'leaveTypeId', as: 'leaves' });
Leave.belongsTo(LeaveType, { foreignKey: 'leaveTypeId', as: 'leaveType' });

// Personnel - Document (1:N)
Personnel.hasMany(Document, { foreignKey: 'personnelId', as: 'documents' });
Document.belongsTo(Personnel, { foreignKey: 'personnelId', as: 'personnel' });

// Personnel - Education (1:N)
Personnel.hasMany(Education, { foreignKey: 'personnelId', as: 'education' });
Education.belongsTo(Personnel, { foreignKey: 'personnelId', as: 'personnel' });

// Personnel - Experience (1:N)
Personnel.hasMany(Experience, { foreignKey: 'personnelId', as: 'experience' });
Experience.belongsTo(Personnel, { foreignKey: 'personnelId', as: 'personnel' });

// Personnel - EmergencyContact (1:N)
Personnel.hasMany(EmergencyContact, { foreignKey: 'personnelId', as: 'emergencyContacts' });
EmergencyContact.belongsTo(Personnel, { foreignKey: 'personnelId', as: 'personnel' });

// Manager relationship
Personnel.belongsTo(Personnel, { foreignKey: 'managerId', as: 'manager' });
Personnel.hasMany(Personnel, { foreignKey: 'managerId', as: 'subordinates' });

module.exports = {
  sequelize,
  User,
  Personnel,
  Department,
  Position,
  Leave,
  LeaveType,
  Document,
  Education,
  Experience,
  EmergencyContact
};