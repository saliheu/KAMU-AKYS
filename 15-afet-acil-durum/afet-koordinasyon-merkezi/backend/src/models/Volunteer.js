const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Volunteer = sequelize.define('Volunteer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  teamId: {
    type: DataTypes.UUID,
    references: {
      model: 'Teams',
      key: 'id'
    }
  },
  registrationNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  idNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  occupation: {
    type: DataTypes.STRING
  },
  employer: {
    type: DataTypes.STRING
  },
  skills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  volunteerExperience: {
    type: DataTypes.JSONB,
    defaultValue: {
      previousDisasters: [],
      totalHours: 0,
      organizations: []
    }
  },
  availability: {
    type: DataTypes.JSONB,
    defaultValue: {
      status: 'available', // available, assigned, inactive
      hours: 'fulltime', // fulltime, parttime, weekends
      startDate: null,
      endDate: null
    }
  },
  trainingCompleted: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    defaultValue: []
    // Format: [{ name, date, organization, certificateNumber }]
  },
  assignedTasks: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    defaultValue: []
  },
  currentLocation: {
    type: DataTypes.GEOGRAPHY('POINT', 4326)
  },
  preferredAreas: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  languages: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: ['tr']
  },
  hasVehicle: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  vehicleInfo: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  equipment: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  emergencyContact: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  medicalInfo: {
    type: DataTypes.JSONB,
    defaultValue: {
      bloodType: null,
      allergies: [],
      medications: [],
      conditions: []
    }
  },
  insuranceInfo: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  backgroundCheck: {
    type: DataTypes.JSONB,
    defaultValue: {
      status: 'pending', // pending, approved, rejected
      date: null,
      notes: null
    }
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  totalServiceHours: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  deactivationReason: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['availability']
    },
    {
      fields: ['teamId']
    },
    {
      fields: ['isActive']
    }
  ]
});

module.exports = Volunteer;