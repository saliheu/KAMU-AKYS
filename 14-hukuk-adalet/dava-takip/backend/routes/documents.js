const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { Document } = require('../models');

router.get('/', authenticate, async (req, res) => {
  res.json({ message: 'Documents route' });
});

module.exports = router;