const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Experience = sequelize.define('Experience', {
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
    company: {
      type: DataTypes.STRING,
      allowNull: false
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false
    },
    department: {
      type: DataTypes.STRING
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY
    },
    isCurrentJob: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    responsibilities: {
      type: DataTypes.TEXT
    },
    achievements: {
      type: DataTypes.TEXT
    },
    reasonForLeaving: {
      type: DataTypes.STRING
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2)
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'TRY'
    },
    referenceContact: {
      type: DataTypes.STRING
    },
    referencePhone: {
      type: DataTypes.STRING
    },
    city: {
      type: DataTypes.STRING
    },
    country: {
      type: DataTypes.STRING,
      defaultValue: 'Turkey'
    }
  }, {
    indexes: [
      {
        fields: ['personnelId']
      },
      {
        fields: ['startDate', 'endDate']
      }
    ]
  });

  return Experience;
};