const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  disasterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Disasters',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'search_rescue',
      'medical',
      'logistics',
      'security',
      'communication',
      'assessment',
      'distribution',
      'evacuation',
      'mixed'
    ),
    allowNull: false
  },
  leaderId: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM(
      'forming',
      'ready',
      'deployed',
      'in_operation',
      'returning',
      'disbanded'
    ),
    defaultValue: 'forming'
  },
  currentLocation: {
    type: DataTypes.GEOGRAPHY('POINT', 4326)
  },
  assignedArea: {
    type: DataTypes.GEOGRAPHY('POLYGON', 4326)
  },
  baseLocation: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  capacity: {
    type: DataTypes.JSONB,
    defaultValue: {
      maxMembers: 10,
      currentMembers: 0
    }
  },
  equipment: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    defaultValue: []
  },
  vehicles: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    defaultValue: []
  },
  communicationChannels: {
    type: DataTypes.JSONB,
    defaultValue: {
      radio: null,
      phone: [],
      satellite: null
    }
  },
  operationLog: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    defaultValue: []
  },
  achievements: {
    type: DataTypes.JSONB,
    defaultValue: {
      peopleRescued: 0,
      peopleEvacuated: 0,
      aidDistributed: 0,
      areasCleared: 0
    }
  },
  shiftSchedule: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  nextReportTime: {
    type: DataTypes.DATE
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['type']
    },
    {
      fields: ['disasterId']
    }
  ]
});

module.exports = Team;