const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HospitalDepartment = sequelize.define('HospitalDepartment', {
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
      allowNull: false,
      references: {
        model: 'Departments',
        key: 'id'
      }
    },
    totalBeds: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    occupiedBeds: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    availableBeds: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    reservedBeds: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    ventilatorTotal: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    ventilatorOccupied: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    staffCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    averageStayDays: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updateMethod: {
      type: DataTypes.ENUM('manual', 'api', 'import'),
      defaultValue: 'manual'
    },
    notes: {
      type: DataTypes.TEXT
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['hospitalId', 'departmentId']
      },
      {
        fields: ['lastUpdated']
      }
    ],
    hooks: {
      beforeSave: async (instance) => {
        // Calculate available beds
        instance.availableBeds = instance.totalBeds - instance.occupiedBeds - instance.reservedBeds;
        instance.lastUpdated = new Date();
      }
    }
  });

  HospitalDepartment.prototype.getOccupancyRate = function() {
    if (this.totalBeds === 0) return 0;
    return ((this.occupiedBeds / this.totalBeds) * 100).toFixed(2);
  };

  return HospitalDepartment;
};