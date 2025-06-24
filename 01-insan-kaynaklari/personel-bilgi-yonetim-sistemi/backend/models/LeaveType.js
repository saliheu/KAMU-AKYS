const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LeaveType = sequelize.define('LeaveType', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    },
    defaultDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    maxDays: {
      type: DataTypes.INTEGER
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    requiresApproval: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    requiresDocument: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    minNoticeDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    allowHalfDay: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    gender: {
      type: DataTypes.ENUM('all', 'male', 'female'),
      defaultValue: 'all'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  return LeaveType;
};