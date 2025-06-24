const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  disasterId: {
    type: DataTypes.UUID,
    references: {
      model: 'Disasters',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'district',
      'neighborhood', 
      'village',
      'building',
      'street',
      'critical_infrastructure',
      'gathering_point',
      'medical_facility',
      'shelter',
      'distribution_center',
      'command_center',
      'other'
    ),
    allowNull: false
  },
  coordinates: {
    type: DataTypes.GEOGRAPHY('POINT', 4326),
    allowNull: false
  },
  boundary: {
    type: DataTypes.GEOGRAPHY('POLYGON', 4326)
  },
  address: {
    type: DataTypes.JSONB,
    defaultValue: {
      province: null,
      district: null,
      neighborhood: null,
      street: null,
      buildingNo: null,
      postalCode: null
    }
  },
  population: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  affectedPopulation: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  damageAssessment: {
    type: DataTypes.JSONB,
    defaultValue: {
      level: null, // none, light, moderate, heavy, destroyed
      assessmentDate: null,
      assessedBy: null,
      details: {}
    }
  },
  accessibility: {
    type: DataTypes.JSONB,
    defaultValue: {
      byRoad: true,
      byAir: false,
      bySea: false,
      obstacles: [],
      lastChecked: null
    }
  },
  infrastructure: {
    type: DataTypes.JSONB,
    defaultValue: {
      electricity: 'unknown',
      water: 'unknown',
      gas: 'unknown',
      telecommunication: 'unknown',
      sewage: 'unknown'
    }
  },
  resources: {
    type: DataTypes.JSONB,
    defaultValue: {
      hospitals: 0,
      schools: 0,
      mosques: 0,
      sportsFacilities: 0,
      warehouses: 0
    }
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  assignedTeams: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  },
  notes: {
    type: DataTypes.TEXT
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  lastUpdatedBy: {
    type: DataTypes.UUID
  },
  weatherConditions: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['disasterId']
    }
  ]
});

module.exports = Location;