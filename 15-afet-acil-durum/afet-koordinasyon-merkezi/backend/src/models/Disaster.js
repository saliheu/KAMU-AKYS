const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Disaster = sequelize.define('Disaster', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM(
      'earthquake',
      'flood',
      'fire',
      'landslide',
      'avalanche',
      'storm',
      'tsunami',
      'pandemic',
      'cbrn', // Chemical, Biological, Radiological, Nuclear
      'terror_attack',
      'other'
    ),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM(
      'alert',
      'active',
      'controlled',
      'recovery',
      'closed'
    ),
    defaultValue: 'alert'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE
  },
  epicenter: {
    type: DataTypes.GEOGRAPHY('POINT', 4326)
  },
  affectedArea: {
    type: DataTypes.GEOGRAPHY('POLYGON', 4326)
  },
  estimatedAffectedPopulation: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  casualties: {
    type: DataTypes.JSONB,
    defaultValue: {
      dead: 0,
      injured: 0,
      missing: 0,
      evacuated: 0
    }
  },
  damage: {
    type: DataTypes.JSONB,
    defaultValue: {
      buildings: {
        destroyed: 0,
        heavyDamage: 0,
        lightDamage: 0
      },
      infrastructure: {},
      economicLoss: 0
    }
  },
  coordinatorId: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  responsePhase: {
    type: DataTypes.ENUM(
      'initial_assessment',
      'search_rescue',
      'emergency_aid',
      'temporary_shelter',
      'recovery',
      'reconstruction'
    ),
    defaultValue: 'initial_assessment'
  },
  weatherConditions: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  additionalInfo: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  mediaFiles: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
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
      fields: ['startDate']
    }
  ]
});

module.exports = Disaster;