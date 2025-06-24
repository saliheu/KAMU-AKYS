const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { Note } = require('../models');

router.get('/', authenticate, async (req, res) => {
  res.json({ message: 'Notes route' });
});

module.exports = router;