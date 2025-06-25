const User = require('../models/User');
const { query } = require('../config/database');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Get additional info based on role
    let profileData = user.toJSON();
    
    if (user.rol === 'avukat') {
      const Lawyer = require('../models/Lawyer');
      const lawyer = await Lawyer.findByUserId(userId);
      if (lawyer) {
        profileData.avukatBilgileri = lawyer;
      }
    } else if (user.rol === 'hakim') {
      const Judge = require('../models/Judge');
      const judge = await Judge.findByUserId(userId);
      if (judge) {
        profileData.hakimBilgileri = judge;
      }
    }

    res.json({ profile: profileData });
  } catch (error) {
    logger.error('Get profile hatası:', error);
    next(error);
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Remove protected fields
    delete updateData.tcKimlikNo;
    delete updateData.rol;
    delete updateData.aktif;
    delete updateData.password;

    // Update user
    await user.update(updateData);

    res.json({
      message: 'Profil güncellendi',
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Update profile hatası:', error);
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Verify current password
    const isValidPassword = await User.verifyPassword(currentPassword, user.sifre_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Mevcut şifre hatalı' });
    }

    // Update password
    await user.update({ password: newPassword });

    res.json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error) {
    logger.error('Change password hatası:', error);
    next(error);
  }
};

// Get user appointments
exports.getUserAppointments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const filters = {
      durum: req.query.durum,
      tarihBaslangic: req.query.tarihBaslangic,
      tarihBitis: req.query.tarihBitis
    };

    const user = await User.findById(userId);
    const appointments = await user.getAppointments(filters);

    res.json({ appointments });
  } catch (error) {
    logger.error('Get user appointments hatası:', error);
    next(error);
  }
};

// Get notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { okunmamis, limit = 20, offset = 0 } = req.query;

    let queryText = `
      SELECT * FROM bildirimler 
      WHERE kullanici_id = $1
    `;
    const values = [userId];
    let paramIndex = 2;

    if (okunmamis === 'true') {
      queryText += ` AND okundu = false`;
    }

    queryText += ` ORDER BY olusturma_tarihi DESC`;
    queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await query(queryText, values);

    res.json({
      notifications: result.rows,
      total: result.rows.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error('Get notifications hatası:', error);
    next(error);
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await query(
      `UPDATE bildirimler 
       SET okundu = true, okunma_tarihi = CURRENT_TIMESTAMP 
       WHERE id = $1 AND kullanici_id = $2`,
      [id, userId]
    );

    res.json({ message: 'Bildirim okundu olarak işaretlendi' });
  } catch (error) {
    logger.error('Mark notification as read hatası:', error);
    next(error);
  }
};

// Get preferences
exports.getPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query(
      'SELECT * FROM kullanici_tercihleri WHERE kullanici_id = $1',
      [userId]
    );

    let preferences = result.rows[0];
    
    // Create default preferences if not exists
    if (!preferences) {
      const insertResult = await query(
        `INSERT INTO kullanici_tercihleri 
         (kullanici_id, email_bildirimleri, sms_bildirimleri, randevu_hatirlatma, hatirlatma_suresi)
         VALUES ($1, true, true, true, 24)
         RETURNING *`,
        [userId]
      );
      preferences = insertResult.rows[0];
    }

    res.json({ preferences });
  } catch (error) {
    logger.error('Get preferences hatası:', error);
    next(error);
  }
};

// Update preferences
exports.updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const fields = [];
    const values = [];
    let index = 1;

    if (updateData.emailBildirimleri !== undefined) {
      fields.push(`email_bildirimleri = $${index++}`);
      values.push(updateData.emailBildirimleri);
    }
    if (updateData.smsBildirimleri !== undefined) {
      fields.push(`sms_bildirimleri = $${index++}`);
      values.push(updateData.smsBildirimleri);
    }
    if (updateData.randevuHatirlatma !== undefined) {
      fields.push(`randevu_hatirlatma = $${index++}`);
      values.push(updateData.randevuHatirlatma);
    }
    if (updateData.hatirlatmaSuresi !== undefined) {
      fields.push(`hatirlatma_suresi = $${index++}`);
      values.push(updateData.hatirlatmaSuresi);
    }

    if (fields.length === 0) {
      return res.json({ message: 'Güncelleme yapılmadı' });
    }

    values.push(userId);
    const updateQuery = `
      UPDATE kullanici_tercihleri 
      SET ${fields.join(', ')}
      WHERE kullanici_id = $${index}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    res.json({
      message: 'Tercihler güncellendi',
      preferences: result.rows[0]
    });
  } catch (error) {
    logger.error('Update preferences hatası:', error);
    next(error);
  }
};

// Admin functions

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const filters = {
      rol: req.query.rol,
      aktif: req.query.aktif,
      search: req.query.search,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0
    };

    let queryText = 'SELECT * FROM kullanicilar WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (filters.rol) {
      queryText += ` AND rol = $${paramIndex}`;
      values.push(filters.rol);
      paramIndex++;
    }

    if (filters.aktif !== undefined) {
      queryText += ` AND aktif = $${paramIndex}`;
      values.push(filters.aktif === 'true');
      paramIndex++;
    }

    if (filters.search) {
      queryText += ` AND (ad ILIKE $${paramIndex} OR soyad ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR tc_kimlik_no LIKE $${paramIndex})`;
      values.push(`%${filters.search}%`);
      paramIndex++;
    }

    queryText += ' ORDER BY olusturma_tarihi DESC';
    queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(filters.limit, filters.offset);

    const result = await query(queryText, values);
    
    // Remove sensitive data
    const users = result.rows.map(user => {
      delete user.sifre_hash;
      return user;
    });

    res.json({
      users,
      total: users.length,
      limit: filters.limit,
      offset: filters.offset
    });
  } catch (error) {
    logger.error('Get all users hatası:', error);
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    logger.error('Get user by ID hatası:', error);
    next(error);
  }
};

// Update user
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Remove protected fields
    delete updateData.tcKimlikNo;
    delete updateData.password;

    await user.update(updateData);

    res.json({
      message: 'Kullanıcı güncellendi',
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Update user hatası:', error);
    next(error);
  }
};

// Activate user
exports.activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    await user.update({ aktif: true });

    res.json({
      message: 'Kullanıcı aktifleştirildi',
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Activate user hatası:', error);
    next(error);
  }
};

// Deactivate user
exports.deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    await user.update({ aktif: false });

    res.json({
      message: 'Kullanıcı deaktif edildi',
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Deactivate user hatası:', error);
    next(error);
  }
};