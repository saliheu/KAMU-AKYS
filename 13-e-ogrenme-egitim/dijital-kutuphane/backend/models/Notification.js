const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
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
    type: {
      type: DataTypes.ENUM(
        'due_reminder',
        'overdue_notice',
        'reservation_ready',
        'new_book',
        'system_message',
        'account_update',
        'fine_notice'
      ),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    relatedId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    relatedType: {
      type: DataTypes.ENUM('book', 'borrowing', 'reservation', 'fine'),
      allowNull: true
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    channel: {
      type: DataTypes.ENUM('in_app', 'email', 'sms', 'push'),
      defaultValue: 'in_app'
    },
    emailSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    smsSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    pushSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId', 'isRead']
      },
      {
        fields: ['type']
      }
    ]
  });

  return Notification;
};