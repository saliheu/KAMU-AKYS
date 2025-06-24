const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Collection = sequelize.define('Collection', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('favorites', 'wishlist', 'reading', 'completed', 'custom'),
      defaultValue: 'custom'
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bookCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    followerCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    }
  }, {
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId', 'type']
      },
      {
        fields: ['isPublic']
      }
    ]
  });

  return Collection;
};