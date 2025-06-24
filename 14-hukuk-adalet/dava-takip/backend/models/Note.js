const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Note extends Model {}

Note.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  caseId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'general', 'legal', 'meeting', 'phone_call',
      'research', 'strategy', 'todo', 'reminder'
    ),
    defaultValue: 'general'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  mentions: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  reminderDate: {
    type: DataTypes.DATE
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  editHistory: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  sequelize,
  modelName: 'Note',
  tableName: 'notes',
  indexes: [
    {
      fields: ['caseId']
    },
    {
      fields: ['authorId']
    },
    {
      fields: ['type']
    }
  ]
});

module.exports = Note;