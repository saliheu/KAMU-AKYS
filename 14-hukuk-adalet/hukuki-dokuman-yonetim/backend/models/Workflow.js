const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Workflow = sequelize.define('Workflow', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  documentId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('approval', 'review', 'signature', 'custom'),
    defaultValue: 'approval'
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'rejected', 'cancelled'),
    defaultValue: 'pending'
  },
  steps: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  currentStep: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  initiatedBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  deadline: {
    type: DataTypes.DATE
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  comments: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  completedAt: {
    type: DataTypes.DATE
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
});

module.exports = Workflow;