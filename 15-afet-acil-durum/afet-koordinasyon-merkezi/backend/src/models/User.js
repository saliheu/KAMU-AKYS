const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM(
      'super_admin',
      'coordinator', 
      'city_manager',
      'institution_officer',
      'ngo_representative',
      'field_officer',
      'volunteer',
      'citizen'
    ),
    defaultValue: 'citizen'
  },
  title: {
    type: DataTypes.STRING
  },
  institutionId: {
    type: DataTypes.UUID,
    references: {
      model: 'Institutions',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastLoginAt: {
    type: DataTypes.DATE
  },
  refreshToken: {
    type: DataTypes.TEXT
  },
  profilePicture: {
    type: DataTypes.STRING
  },
  emergencyContact: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  skills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  location: {
    type: DataTypes.GEOGRAPHY('POINT', 4326)
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// Instance methods
User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  delete values.refreshToken;
  return values;
};

module.exports = User;