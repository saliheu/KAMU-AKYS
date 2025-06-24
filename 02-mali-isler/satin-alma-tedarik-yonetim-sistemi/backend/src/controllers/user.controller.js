const { User } = require('../models');
const { Op } = require('sequelize');

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { sicilNo: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      users: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalUsers: count
    });
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcılar getirilemedi' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcı getirilemedi' });
  }
};

exports.getProfile = async (req, res) => {
  res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, department, password } = req.body;
    const user = req.user;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (department) user.department = department;
    if (password) user.password = password;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Profil güncellenemedi' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const { role, isActive, department } = req.body;
    
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (department) user.department = department;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcı güncellenemedi' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Soft delete - sadece deaktif et
    user.isActive = false;
    await user.save();

    res.json({ message: 'Kullanıcı deaktif edildi' });
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcı silinemedi' });
  }
};