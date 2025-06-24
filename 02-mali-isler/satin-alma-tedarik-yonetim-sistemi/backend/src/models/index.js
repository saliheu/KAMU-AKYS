const { sequelize } = require('../config/database');
const User = require('./User');
const Supplier = require('./Supplier');
const PurchaseRequest = require('./PurchaseRequest');
const Tender = require('./Tender');
const Bid = require('./Bid');
const Contract = require('./Contract');
const PurchaseOrder = require('./PurchaseOrder');
const OrderItem = require('./OrderItem');

// User - PurchaseRequest associations
User.hasMany(PurchaseRequest, { foreignKey: 'requesterId', as: 'requests' });
PurchaseRequest.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });

// PurchaseRequest - Tender associations
PurchaseRequest.hasMany(Tender, { foreignKey: 'purchaseRequestId', as: 'tenders' });
Tender.belongsTo(PurchaseRequest, { foreignKey: 'purchaseRequestId', as: 'purchaseRequest' });

// Tender - Bid associations
Tender.hasMany(Bid, { foreignKey: 'tenderId', as: 'bids' });
Bid.belongsTo(Tender, { foreignKey: 'tenderId', as: 'tender' });

// Supplier - Bid associations
Supplier.hasMany(Bid, { foreignKey: 'supplierId', as: 'bids' });
Bid.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });

// Tender - Contract associations
Tender.hasOne(Contract, { foreignKey: 'tenderId', as: 'contract' });
Contract.belongsTo(Tender, { foreignKey: 'tenderId', as: 'tender' });

// Supplier - Contract associations
Supplier.hasMany(Contract, { foreignKey: 'supplierId', as: 'contracts' });
Contract.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });

// Contract - PurchaseOrder associations
Contract.hasMany(PurchaseOrder, { foreignKey: 'contractId', as: 'orders' });
PurchaseOrder.belongsTo(Contract, { foreignKey: 'contractId', as: 'contract' });

// Supplier - PurchaseOrder associations
Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplierId', as: 'orders' });
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });

// PurchaseOrder - OrderItem associations
PurchaseOrder.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(PurchaseOrder, { foreignKey: 'orderId', as: 'order' });

// User - PurchaseOrder associations
User.hasMany(PurchaseOrder, { foreignKey: 'createdBy', as: 'createdOrders' });
PurchaseOrder.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

module.exports = {
  sequelize,
  User,
  Supplier,
  PurchaseRequest,
  Tender,
  Bid,
  Contract,
  PurchaseOrder,
  OrderItem
};