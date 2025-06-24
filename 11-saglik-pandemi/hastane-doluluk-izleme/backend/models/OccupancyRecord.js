const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OccupancyRecord = sequelize.define('OccupancyRecord', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    hospitalDepartmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'HospitalDepartments',
        key: 'id'
      }
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    totalBeds: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    occupiedBeds: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    availableBeds: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reservedBeds: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    occupancyRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    ventilatorTotal: {
      type: DataTypes.INTEGER
    },
    ventilatorOccupied: {
      type: DataTypes.INTEGER
    },
    admissions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of admissions in the period'
    },
    discharges: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of discharges in the period'
    },
    transfers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of transfers in the period'
    },
    criticalPatients: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    averageWaitTime: {
      type: DataTypes.INTEGER,
      comment: 'Average wait time in minutes'
    },
    staffOnDuty: {
      type: DataTypes.INTEGER
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    indexes: [
      {
        fields: ['hospitalDepartmentId', 'timestamp']
      },
      {
        fields: ['timestamp']
      },
      {
        fields: ['occupancyRate']
      }
    ]
  });

  return OccupancyRecord;
};