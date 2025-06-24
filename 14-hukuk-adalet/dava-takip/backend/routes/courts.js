const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { Court } = require('../models');

router.get('/', authenticate, async (req, res) => {
  res.json({ message: 'Courts route' });
});

module.exports = router;