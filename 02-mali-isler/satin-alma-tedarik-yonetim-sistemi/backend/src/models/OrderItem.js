const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  productCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false
  },
  unitPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 20
  },
  taxAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  deliveredQuantity: {
    type: DataTypes.DECIMAL(10, 3),
    defaultValue: 0
  },
  remainingQuantity: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.quantity - this.deliveredQuantity;
    }
  }
});

module.exports = OrderItem;