const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Department = sequelize.define('Department', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    },
    parentId: {
      type: DataTypes.UUID,
      references: {
        model: 'Departments',
        key: 'id'
      }
    },
    managerId: {
      type: DataTypes.UUID,
      references: {
        model: 'Personnel',
        key: 'id'
      }
    },
    budget: {
      type: DataTypes.DECIMAL(12, 2)
    },
    location: {
      type: DataTypes.STRING
    },
    phone: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
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
        fields: ['parentId']
      }
    ]
  });

  // Self-referencing association for hierarchical structure
  Department.associate = (models) => {
    Department.belongsTo(Department, { as: 'parent', foreignKey: 'parentId' });
    Department.hasMany(Department, { as: 'children', foreignKey: 'parentId' });
    Department.belongsTo(models.Personnel, { as: 'manager', foreignKey: 'managerId' });
  };

  return Department;
};