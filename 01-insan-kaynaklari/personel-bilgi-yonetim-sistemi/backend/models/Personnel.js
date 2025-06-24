const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Personnel = sequelize.define('Personnel', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    employeeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    middleName: {
      type: DataTypes.STRING
    },
    nationalId: {
      type: DataTypes.STRING(11),
      allowNull: false,
      unique: true
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: false
    },
    maritalStatus: {
      type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed'),
      defaultValue: 'single'
    },
    bloodType: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    alternativePhone: {
      type: DataTypes.STRING
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
    postalCode: {
      type: DataTypes.STRING
    },
    hireDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    employmentType: {
      type: DataTypes.ENUM('permanent', 'contract', 'temporary', 'intern'),
      defaultValue: 'permanent'
    },
    workLocation: {
      type: DataTypes.STRING
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2)
    },
    bankName: {
      type: DataTypes.STRING
    },
    bankAccount: {
      type: DataTypes.STRING
    },
    iban: {
      type: DataTypes.STRING
    },
    photo: {
      type: DataTypes.STRING
    },
    militaryStatus: {
      type: DataTypes.ENUM('completed', 'postponed', 'exempt', 'not_applicable')
    },
    militaryPostponeDate: {
      type: DataTypes.DATEONLY
    },
    driverLicense: {
      type: DataTypes.STRING
    },
    vehiclePlate: {
      type: DataTypes.STRING
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    departmentId: {
      type: DataTypes.UUID,
      references: {
        model: 'Departments',
        key: 'id'
      }
    },
    positionId: {
      type: DataTypes.UUID,
      references: {
        model: 'Positions',
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
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'on_leave', 'terminated'),
      defaultValue: 'active'
    },
    terminationDate: {
      type: DataTypes.DATEONLY
    },
    terminationReason: {
      type: DataTypes.TEXT
    }
  }, {
    indexes: [
      {
        fields: ['employeeId']
      },
      {
        fields: ['nationalId']
      },
      {
        fields: ['departmentId']
      },
      {
        fields: ['status']
      }
    ]
  });

  Personnel.prototype.getFullName = function() {
    return `${this.firstName} ${this.middleName || ''} ${this.lastName}`.trim();
  };

  return Personnel;
};