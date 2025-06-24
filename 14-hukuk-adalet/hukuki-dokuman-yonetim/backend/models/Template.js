const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Template = sequelize.define('Template', {
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
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  variables: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  usage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
});

module.exports = Template;