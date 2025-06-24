const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Hospital = sequelize.define('Hospital', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('public', 'private', 'university', 'military'),
      defaultValue: 'public'
    },
    level: {
      type: DataTypes.ENUM('A', 'B', 'C', 'D', 'E'),
      comment: 'Hospital service level classification'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    district: {
      type: DataTypes.STRING
    },
    region: {
      type: DataTypes.STRING,
      allowNull: false
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8)
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8)
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    totalBeds: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    emergencyContact: {
      type: DataTypes.STRING
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    integrationEndpoint: {
      type: DataTypes.STRING,
      comment: 'API endpoint for automated data collection'
    },
    integrationToken: {
      type: DataTypes.STRING,
      comment: 'API token for authentication'
    }
  }, {
    indexes: [
      {
        fields: ['city']
      },
      {
        fields: ['region']
      },
      {
        fields: ['type']
      }
    ]
  });

  return Hospital;
};