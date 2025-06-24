const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Leave = sequelize.define('Leave', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    personnelId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Personnel',
        key: 'id'
      }
    },
    leaveTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'LeaveTypes',
        key: 'id'
      }
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    totalDays: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
      defaultValue: 'pending'
    },
    approvedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'Personnel',
        key: 'id'
      }
    },
    approvedDate: {
      type: DataTypes.DATE
    },
    approverComments: {
      type: DataTypes.TEXT
    },
    attachments: {
      type: DataTypes.TEXT,
      comment: 'JSON array of attachment URLs'
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    emergencyContact: {
      type: DataTypes.STRING
    }
  }, {
    indexes: [
      {
        fields: ['personnelId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['startDate', 'endDate']
      }
    ]
  });

  Leave.associate = (models) => {
    Leave.belongsTo(models.Personnel, { as: 'approver', foreignKey: 'approvedBy' });
  };

  return Leave;
};