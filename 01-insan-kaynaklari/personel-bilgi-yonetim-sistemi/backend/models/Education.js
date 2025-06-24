const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Education = sequelize.define('Education', {
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
    level: {
      type: DataTypes.ENUM('primary', 'secondary', 'high_school', 'associate', 'bachelor', 'master', 'phd'),
      allowNull: false
    },
    institution: {
      type: DataTypes.STRING,
      allowNull: false
    },
    faculty: {
      type: DataTypes.STRING
    },
    department: {
      type: DataTypes.STRING
    },
    fieldOfStudy: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY
    },
    graduationDate: {
      type: DataTypes.DATEONLY
    },
    isGraduated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    grade: {
      type: DataTypes.STRING
    },
    gradeScale: {
      type: DataTypes.STRING
    },
    diplomaNumber: {
      type: DataTypes.STRING
    },
    country: {
      type: DataTypes.STRING,
      defaultValue: 'Turkey'
    },
    city: {
      type: DataTypes.STRING
    }
  }, {
    indexes: [
      {
        fields: ['personnelId']
      },
      {
        fields: ['level']
      }
    ]
  });

  return Education;
};