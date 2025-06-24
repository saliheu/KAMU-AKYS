const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { Client } = require('../models');

router.get('/', authenticate, async (req, res) => {
  res.json({ message: 'Clients route' });
});

module.exports = router;