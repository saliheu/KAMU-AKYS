const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Personnel = sequelize.define('Personnel', {
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
  institutionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Institutions',
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
  personnelCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  rank: {
    type: DataTypes.STRING
  },
  specialization: {
    type: DataTypes.ENUM(
      'search_rescue',
      'medical',
      'paramedic',
      'firefighter',
      'engineer',
      'k9_handler',
      'drone_operator',
      'communications',
      'logistics',
      'psychologist',
      'translator',
      'other'
    ),
    allowNull: false
  },
  certifications: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    defaultValue: []
    // Format: [{ name, issuer, issueDate, expiryDate, certificateNumber }]
  },
  skills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  experience: {
    type: DataTypes.JSONB,
    defaultValue: {
      years: 0,
      disasters: []
    }
  },
  availability: {
    type: DataTypes.ENUM('available', 'on_duty', 'off_duty', 'leave'),
    defaultValue: 'available'
  },
  currentLocation: {
    type: DataTypes.GEOGRAPHY('POINT', 4326)
  },
  assignmentHistory: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    defaultValue: []
  },
  equipment: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
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
  emergencyContact: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  languages: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: ['tr']
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['availability']
    },
    {
      fields: ['specialization']
    },
    {
      fields: ['institutionId']
    },
    {
      fields: ['teamId']
    }
  ]
});

module.exports = Personnel;