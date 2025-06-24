const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
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
  type: {
    type: DataTypes.ENUM(
      'situation',
      'damage_assessment',
      'resource_status',
      'daily',
      'weekly',
      'final',
      'media',
      'financial',
      'custom'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reportNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  period: {
    type: DataTypes.JSONB,
    defaultValue: {
      start: null,
      end: null
    }
  },
  generatedById: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM(
      'draft',
      'pending_review',
      'approved',
      'published',
      'archived'
    ),
    defaultValue: 'draft'
  },
  content: {
    type: DataTypes.JSONB,
    defaultValue: {
      summary: null,
      sections: [],
      statistics: {},
      recommendations: []
    }
  },
  data: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    defaultValue: []
    // Format: [{ name, url, type, size }]
  },
  distribution: {
    type: DataTypes.JSONB,
    defaultValue: {
      internal: [],
      external: [],
      media: false,
      public: false
    }
  },
  approvals: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    defaultValue: []
    // Format: [{ userId, name, role, date, status, comments }]
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'tr'
  },
  translations: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  publishedAt: {
    type: DataTypes.DATE
  },
  publishedUrl: {
    type: DataTypes.STRING
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
    },
    {
      fields: ['reportNumber']
    }
  ]
});

module.exports = Report;