const { Supplier } = require('../models');
const { Op } = require('sequelize');

exports.getAllSuppliers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, isActive } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { companyName: { [Op.iLike]: `%${search}%` } },
        { taxNumber: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (category) {
      where.category = category;
    }
    
    if (typeof isActive !== 'undefined') {
      where.isActive = isActive === 'true';
    }

    const { count, rows } = await Supplier.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      suppliers: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalSuppliers: count
    });
  } catch (error) {
    res.status(500).json({ error: 'Tedarikçiler getirilemedi' });
  }
};

exports.getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ error: 'Tedarikçi bulunamadı' });
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Tedarikçi getirilemedi' });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Bu vergi numarası zaten kayıtlı' });
    }
    res.status(500).json({ error: 'Tedarikçi oluşturulamadı' });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ error: 'Tedarikçi bulunamadı' });
    }

    await supplier.update(req.body);
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Tedarikçi güncellenemedi' });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ error: 'Tedarikçi bulunamadı' });
    }

    // Soft delete
    supplier.isActive = false;
    await supplier.save();

    res.json({ message: 'Tedarikçi deaktif edildi' });
  } catch (error) {
    res.status(500).json({ error: 'Tedarikçi silinemedi' });
  }
};