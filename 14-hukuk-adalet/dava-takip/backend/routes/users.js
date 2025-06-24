const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { User } = require('../models');

router.get('/', authenticate, authorize('admin'), async (req, res) => {
  const users = await User.findAll({ attributes: { exclude: ['password', 'refreshToken'] } });
  res.json({ users });
});

module.exports = router;