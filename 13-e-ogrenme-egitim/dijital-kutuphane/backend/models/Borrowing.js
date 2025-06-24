const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Borrowing = sequelize.define('Borrowing', {
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
    borrowDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    returnDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'returned', 'overdue', 'lost'),
      defaultValue: 'active'
    },
    renewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    maxRenewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 2
    },
    fine: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    finePaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    issuedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    returnedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    condition: {
      type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'damaged'),
      defaultValue: 'good'
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
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
        fields: ['dueDate']
      }
    ]
  });

  Borrowing.calculateFine = function(dueDate, returnDate = new Date()) {
    const daysLate = Math.floor((returnDate - dueDate) / (1000 * 60 * 60 * 24));
    if (daysLate <= 0) return 0;
    
    // 1 TL per day for first week, 2 TL per day after
    if (daysLate <= 7) {
      return daysLate * 1;
    } else {
      return 7 + (daysLate - 7) * 2;
    }
  };

  return Borrowing;
};