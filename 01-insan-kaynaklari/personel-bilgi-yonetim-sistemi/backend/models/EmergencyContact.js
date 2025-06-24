const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EmergencyContact = sequelize.define('EmergencyContact', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    personnelId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Personnel',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    relationship: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    alternativePhone: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    address: {
      type: DataTypes.TEXT
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    indexes: [
      {
        fields: ['personnelId']
      }
    ]
  });

  return EmergencyContact;
};