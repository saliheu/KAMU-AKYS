const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Position = sequelize.define('Position', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Position level in hierarchy (1-10)'
    },
    category: {
      type: DataTypes.ENUM('management', 'professional', 'technical', 'administrative', 'support'),
      allowNull: false
    },
    minSalary: {
      type: DataTypes.DECIMAL(10, 2)
    },
    maxSalary: {
      type: DataTypes.DECIMAL(10, 2)
    },
    requirements: {
      type: DataTypes.TEXT,
      comment: 'Job requirements in JSON format'
    },
    responsibilities: {
      type: DataTypes.TEXT,
      comment: 'Job responsibilities in JSON format'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    indexes: [
      {
        fields: ['code']
      },
      {
        fields: ['level']
      },
      {
        fields: ['category']
      }
    ]
  });

  return Position;
};