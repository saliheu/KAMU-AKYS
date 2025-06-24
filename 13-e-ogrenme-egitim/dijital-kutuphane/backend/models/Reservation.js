const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Reservation = sequelize.define('Reservation', {
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
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'books',
        key: 'id'
      }
    },
    reservationDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'ready', 'fulfilled', 'cancelled', 'expired'),
      defaultValue: 'pending'
    },
    queuePosition: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    notificationSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    notificationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    pickupDeadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId', 'status']
      },
      {
        fields: ['bookId', 'status']
      },
      {
        fields: ['status', 'queuePosition']
      }
    ]
  });

  return Reservation;
};