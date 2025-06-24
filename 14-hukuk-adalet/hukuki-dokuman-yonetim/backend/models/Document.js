const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER
  },
  mimeType: {
    type: DataTypes.STRING
  },
  category: {
    type: DataTypes.ENUM(
      'contract',
      'agreement',
      'regulation',
      'decree',
      'circular',
      'court_decision',
      'legal_opinion',
      'power_of_attorney',
      'other'
    ),
    defaultValue: 'other'
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending_review', 'approved', 'archived', 'expired'),
    defaultValue: 'draft'
  },
  confidentialityLevel: {
    type: DataTypes.ENUM('public', 'internal', 'confidential', 'top_secret'),
    defaultValue: 'internal'
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  validFrom: {
    type: DataTypes.DATE
  },
  validUntil: {
    type: DataTypes.DATE
  },
  isTemplate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  parentDocumentId: {
    type: DataTypes.UUID
  },
  currentVersion: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lockedBy: {
    type: DataTypes.UUID
  },
  lockedAt: {
    type: DataTypes.DATE
  },
  checksum: {
    type: DataTypes.STRING
  },
  fullTextContent: {
    type: DataTypes.TEXT
  },
  ocrProcessed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  digitallySignedBy: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  },
  signatureRequiredBy: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  }
});