const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { User } = require('../models');

router.get('/', authenticate, async (req, res) => {
  res.json({ message: 'Lawyers route' });
});

module.exports = router;