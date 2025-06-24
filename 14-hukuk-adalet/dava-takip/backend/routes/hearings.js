const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { Hearing } = require('../models');

router.get('/', authenticate, async (req, res) => {
  res.json({ message: 'Hearings route' });
});

module.exports = router;