const router = require('express').Router();
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  res.json({ message: 'Dashboard route' });
});

module.exports = router;