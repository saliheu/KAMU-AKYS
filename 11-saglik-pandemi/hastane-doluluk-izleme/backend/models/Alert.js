const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Alert = sequelize.define('Alert', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    hospitalId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Hospitals',
        key: 'id'
      }
    },
    departmentId: {
      type: DataTypes.UUID,
      references: {
        model: 'Departments',
        key: 'id'
      }
    },
    alertRuleId: {
      type: DataTypes.UUID,
      references: {
        model: 'AlertRules',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('critical', 'warning', 'info'),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    metric: {
      type: DataTypes.STRING,
      comment: 'The metric that triggered the alert (e.g., occupancy_rate)'
    },
    currentValue: {
      type: DataTypes.DECIMAL(10, 2),
      comment: 'Current value of the metric'
    },
    thresholdValue: {
      type: DataTypes.DECIMAL(10, 2),
      comment: 'Threshold value that was exceeded'
    },
    status: {
      type: DataTypes.ENUM('active', 'acknowledged', 'resolved'),
      defaultValue: 'active'
    },
    acknowledgedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    acknowledgedAt: {
      type: DataTypes.DATE
    },
    resolvedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    resolvedAt: {
      type: DataTypes.DATE
    },
    notificationsSent: {
      type: DataTypes.JSON,
      defaultValue: {
        email: false,
        sms: false,
        push: false
      }
    }
  }, {
    indexes: [
      {
        fields: ['hospitalId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['type']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return Alert;
};