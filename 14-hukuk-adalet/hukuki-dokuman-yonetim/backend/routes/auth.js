const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { auth } = require('../middleware/auth');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
  
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }
  );
  
  return { accessToken, refreshToken };
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, title } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      department,
      title,
      role: 'viewer'
    });

    const { accessToken, refreshToken } = generateTokens(user.id);

    res.status(201).json({
      user: user.toJSON(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !await user.validatePassword(password)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user.id);

    res.json({
      user: user.toJSON(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user.id);

    res.json(tokens);
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user.toJSON() });
});

router.put('/me', auth, async (req, res) => {
  try {
    const { name, phone, preferences } = req.body;

    req.user.name = name || req.user.name;
    req.user.phone = phone || req.user.phone;
    if (preferences) {
      req.user.preferences = { ...req.user.preferences, ...preferences };
    }

    await req.user.save();

    res.json({ user: req.user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!await req.user.validatePassword(currentPassword)) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
});

router.post('/logout', auth, async (req, res) => {
  const redisClient = req.app.get('redisClient');
  await redisClient.set(`blacklist_${req.token}`, 'true', {
    EX: 86400
  });

  res.json({ message: 'Logged out successfully' });
});

module.exports = router;