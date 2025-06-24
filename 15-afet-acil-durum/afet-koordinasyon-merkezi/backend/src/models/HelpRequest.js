const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HelpRequest = sequelize.define('HelpRequest', {
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
  requestType: {
    type: DataTypes.ENUM(
      'rescue',
      'medical',
      'food',
      'water',
      'shelter',
      'evacuation',
      'missing_person',
      'debris_removal',
      'other'
    ),
    allowNull: false
  },
  urgency: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'assigned',
      'in_progress',
      'completed',
      'cancelled',
      'unreachable'
    ),
    defaultValue: 'pending'
  },
  requesterName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  requesterPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  requesterEmail: {
    type: DataTypes.STRING
  },
  numberOfPeople: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  hasChildren: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasElderly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasDisabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasInjured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  locationId: {
    type: DataTypes.UUID,
    references: {
      model: 'Locations',
      key: 'id'
    }
  },
  exactLocation: {
    type: DataTypes.GEOGRAPHY('POINT', 4326)
  },
  address: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  landmark: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  additionalInfo: {
    type: DataTypes.TEXT
  },
  assignedTeamId: {
    type: DataTypes.UUID,
    references: {
      model: 'Teams',
      key: 'id'
    }
  },
  assignedById: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  assignedAt: {
    type: DataTypes.DATE
  },
  completedAt: {
    type: DataTypes.DATE
  },
  completionNotes: {
    type: DataTypes.TEXT
  },
  verificationCode: {
    type: DataTypes.STRING
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  source: {
    type: DataTypes.ENUM('app', 'web', 'phone', 'sms', 'field', 'social_media'),
    defaultValue: 'web'
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  voiceRecording: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['urgency']
    },
    {
      fields: ['requestType']
    },
    {
      fields: ['disasterId']
    },
    {
      fields: ['assignedTeamId']
    }
  ]
});

module.exports = HelpRequest;