const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Department = sequelize.define('Department', {
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
    category: {
      type: DataTypes.ENUM(
        'emergency',
        'icu',
        'surgery',
        'internal_medicine',
        'pediatrics',
        'obstetrics',
        'psychiatry',
        'cardiology',
        'neurology',
        'oncology',
        'orthopedics',
        'other'
      ),
      allowNull: false
    },
    isCritical: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Critical departments like ICU, Emergency'
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#3B82F6',
      comment: 'Color code for UI representation'
    },
    icon: {
      type: DataTypes.STRING,
      comment: 'Icon name for UI'
    },
    description: {
      type: DataTypes.TEXT
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  return Department;
};