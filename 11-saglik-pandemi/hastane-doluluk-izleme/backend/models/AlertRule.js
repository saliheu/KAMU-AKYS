const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AlertRule = sequelize.define('AlertRule', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    metric: {
      type: DataTypes.ENUM(
        'occupancy_rate',
        'available_beds',
        'wait_time',
        'ventilator_usage',
        'staff_shortage',
        'rapid_increase'
      ),
      allowNull: false
    },
    condition: {
      type: DataTypes.ENUM('greater_than', 'less_than', 'equals', 'change_rate'),
      allowNull: false
    },
    threshold: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    timeWindow: {
      type: DataTypes.INTEGER,
      comment: 'Time window in minutes for rate-based alerts'
    },
    severity: {
      type: DataTypes.ENUM('critical', 'warning', 'info'),
      allowNull: false
    },
    scope: {
      type: DataTypes.ENUM('global', 'hospital', 'department'),
      defaultValue: 'global'
    },
    departmentCategories: {
      type: DataTypes.JSON,
      comment: 'Array of department categories this rule applies to'
    },
    notificationChannels: {
      type: DataTypes.JSON,
      defaultValue: ['email'],
      comment: 'Array of notification channels: email, sms, push'
    },
    cooldownMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 60,
      comment: 'Minutes to wait before triggering the same alert again'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  return AlertRule;
};