const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Task extends Model {}

Task.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  caseId: {
    type: DataTypes.UUID
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
      'research', 'document_preparation', 'court_filing',
      'client_meeting', 'deadline', 'payment', 'other'
    ),
    defaultValue: 'other'
  },
  status: {
    type: DataTypes.ENUM(
      'pending', 'in_progress', 'completed', 'cancelled', 'overdue'
    ),
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: false
  },
  assignedBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  completedAt: {
    type: DataTypes.DATE
  },
  estimatedHours: {
    type: DataTypes.DECIMAL(5, 2)
  },
  actualHours: {
    type: DataTypes.DECIMAL(5, 2)
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  checklist: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  comments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reminderDate: {
    type: DataTypes.DATE
  }
}, {
  sequelize,
  modelName: 'Task',
  tableName: 'tasks',
  indexes: [
    {
      fields: ['assignedTo']
    },
    {
      fields: ['status']
    },
    {
      fields: ['dueDate']
    },
    {
      fields: ['caseId']
    }
  ]
});

module.exports = Task;