const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { Notification } = require('../models');

router.get('/', authenticate, async (req, res) => {
  res.json({ message: 'Notifications route' });
});

module.exports = router;