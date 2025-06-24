const { PurchaseOrder, OrderItem, Contract, Supplier } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

const generateOrderNumber = async () => {
  const year = new Date().getFullYear();
  const lastOrder = await PurchaseOrder.findOne({
    where: {
      orderNumber: {
        [Op.like]: `SP-${year}-%`
      }
    },
    order: [['createdAt', 'DESC']]
  });

  let nextNumber = 1;
  if (lastOrder) {
    const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `SP-${year}-${nextNumber.toString().padStart(6, '0')}`;
};

exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await PurchaseOrder.findAndCountAll({
      where,
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'companyName', 'taxNumber']
        },
        {
          model: Contract,
          as: 'contract',
          attributes: ['id', 'contractNumber']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      orders: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalOrders: count
    });
  } catch (error) {
    res.status(500).json({ error: 'Siparişler getirilemedi' });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id, {
      include: [
        {
          model: Supplier,
          as: 'supplier'
        },
        {
          model: Contract,
          as: 'contract'
        },
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Sipariş getirilemedi' });
  }
};

exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const contract = await Contract.findByPk(req.body.contractId);
    
    if (!contract) {
      await t.rollback();
      return res.status(404).json({ error: 'Sözleşme bulunamadı' });
    }

    if (contract.status !== 'aktif') {
      await t.rollback();
      return res.status(400).json({ error: 'Sadece aktif sözleşmeler için sipariş oluşturulabilir' });
    }

    // Sipariş toplamlarını hesapla
    const items = req.body.items || [];
    let totalAmount = 0;
    let taxAmount = 0;

    for (const item of items) {
      const itemTotal = item.quantity * item.unitPrice;
      const itemTax = itemTotal * (item.taxRate / 100);
      totalAmount += itemTotal;
      taxAmount += itemTax;
    }

    const orderData = {
      ...req.body,
      orderNumber: await generateOrderNumber(),
      supplierId: contract.supplierId,
      totalAmount,
      taxAmount,
      grandTotal: totalAmount + taxAmount,
      createdBy: req.user.id,
      status: 'beklemede'
    };

    const order = await PurchaseOrder.create(orderData, { transaction: t });

    // Sipariş kalemlerini oluştur
    if (items.length > 0) {
      const orderItems = items.map(item => ({
        ...item,
        orderId: order.id,
        taxAmount: item.quantity * item.unitPrice * (item.taxRate / 100),
        totalAmount: item.quantity * item.unitPrice * (1 + item.taxRate / 100)
      }));

      await OrderItem.bulkCreate(orderItems, { transaction: t });
    }

    await t.commit();

    const createdOrder = await PurchaseOrder.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }]
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Sipariş oluşturulamadı' });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    if (order.status !== 'beklemede') {
      return res.status(400).json({ error: 'Sadece beklemedeki siparişler güncellenebilir' });
    }

    await order.update(req.body);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Sipariş güncellenemedi' });
  }
};

exports.approveOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    if (order.status !== 'beklemede') {
      return res.status(400).json({ error: 'Bu sipariş onaylanamaz' });
    }

    order.status = 'onaylandi';
    order.approvedBy = req.user.id;
    order.approvalDate = new Date();

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Sipariş onaylanamadı' });
  }
};

exports.deliverOrder = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const order = await PurchaseOrder.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items' }]
    });
    
    if (!order) {
      await t.rollback();
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    if (order.status !== 'onaylandi') {
      await t.rollback();
      return res.status(400).json({ error: 'Sadece onaylı siparişler teslim alınabilir' });
    }

    const { deliveredItems } = req.body;

    // Teslim alınan kalemleri güncelle
    for (const deliveredItem of deliveredItems) {
      const orderItem = await OrderItem.findByPk(deliveredItem.itemId);
      if (orderItem && orderItem.orderId === order.id) {
        orderItem.deliveredQuantity = deliveredItem.deliveredQuantity;
        await orderItem.save({ transaction: t });
      }
    }

    // Tüm kalemler teslim alındı mı kontrol et
    const updatedItems = await OrderItem.findAll({
      where: { orderId: order.id },
      transaction: t
    });

    const allDelivered = updatedItems.every(item => 
      item.deliveredQuantity >= item.quantity
    );

    const partiallyDelivered = updatedItems.some(item => 
      item.deliveredQuantity > 0 && item.deliveredQuantity < item.quantity
    );

    if (allDelivered) {
      order.status = 'teslim_alindi';
    } else if (partiallyDelivered) {
      order.status = 'kismen_teslim';
    }

    await order.save({ transaction: t });
    await t.commit();

    res.json(order);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Teslimat işlemi gerçekleştirilemedi' });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    if (order.status !== 'beklemede') {
      return res.status(400).json({ error: 'Sadece beklemedeki siparişler iptal edilebilir' });
    }

    order.status = 'iptal';
    await order.save();

    res.json({ message: 'Sipariş iptal edildi' });
  } catch (error) {
    res.status(500).json({ error: 'Sipariş iptal edilemedi' });
  }
};