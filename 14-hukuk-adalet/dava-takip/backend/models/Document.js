const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Document extends Model {}

Document.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  caseId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  type: {
    type: DataTypes.ENUM(
      'petition', 'response', 'evidence', 'court_decision',
      'expert_report', 'witness_statement', 'contract',
      'invoice', 'receipt', 'correspondence', 'power_of_attorney',
      'notification', 'minutes', 'other'
    ),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM(
      'incoming', 'outgoing', 'court', 'internal'
    ),
    defaultValue: 'internal'
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER
  },
  mimeType: {
    type: DataTypes.STRING
  },
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  previousVersionId: {
    type: DataTypes.UUID
  },
  documentDate: {
    type: DataTypes.DATE
  },
  dueDate: {
    type: DataTypes.DATE
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  isConfidential: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  accessList: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  ocrText: {
    type: DataTypes.TEXT
  },
  ocrProcessed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  checksum: {
    type: DataTypes.STRING
  },
  signatureInfo: {
    type: DataTypes.JSONB,
    defaultValue: null
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  deletedAt: {
    type: DataTypes.DATE
  },
  deletedBy: {
    type: DataTypes.UUID
  }
}, {
  sequelize,
  modelName: 'Document',
  tableName: 'documents',
  indexes: [
    {
      fields: ['caseId']
    },
    {
      fields: ['type']
    },
    {
      fields: ['uploadedBy']
    },
    {
      fields: ['documentDate']
    }
  ]
});

module.exports = Document;