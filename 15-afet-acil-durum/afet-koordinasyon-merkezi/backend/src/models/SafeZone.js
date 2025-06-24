const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SafeZone = sequelize.define('SafeZone', {
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
  locationId: {
    type: DataTypes.UUID,
    references: {
      model: 'Locations',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'gathering_point',
      'temporary_shelter',
      'tent_city',
      'container_city',
      'evacuation_point',
      'distribution_center',
      'medical_point',
      'command_center'
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
  capacity: {
    type: DataTypes.JSONB,
    defaultValue: {
      total: 0,
      families: 0,
      current: 0,
      available: 0
    }
  },
  facilities: {
    type: DataTypes.JSONB,
    defaultValue: {
      toilets: 0,
      showers: 0,
      waterPoints: 0,
      electricityPoints: 0,
      kitchens: 0,
      medicalUnits: 0
    }
  },
  services: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
    // ['medical', 'food', 'water', 'hygiene', 'psychological_support', 'childcare', etc.]
  },
  managedBy: {
    type: DataTypes.JSONB,
    defaultValue: {
      institution: null,
      manager: null,
      contact: {}
    }
  },
  status: {
    type: DataTypes.ENUM(
      'preparing',
      'active',
      'full',
      'closing',
      'closed'
    ),
    defaultValue: 'preparing'
  },
  accessibility: {
    type: DataTypes.JSONB,
    defaultValue: {
      wheelchairAccessible: false,
      publicTransport: false,
      parkingAvailable: false,
      nearestHospital: null
    }
  },
  demographics: {
    type: DataTypes.JSONB,
    defaultValue: {
      children: 0,
      adults: 0,
      elderly: 0,
      disabled: 0,
      families: 0
    }
  },
  supplies: {
    type: DataTypes.JSONB,
    defaultValue: {
      lastSupplyDate: null,
      nextSupplyDate: null,
      urgentNeeds: []
    }
  },
  security: {
    type: DataTypes.JSONB,
    defaultValue: {
      personnel: 0,
      cameras: 0,
      lighting: false,
      fencing: false
    }
  },
  registrationRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  openingDate: {
    type: DataTypes.DATE
  },
  closingDate: {
    type: DataTypes.DATE
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  contactInfo: {
    type: DataTypes.JSONB,
    defaultValue: {
      phone: [],
      email: null,
      radio: null
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['disasterId']
    }
  ]
});

module.exports = SafeZone;