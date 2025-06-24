const router = require('express').Router();
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  res.json({ message: 'Reports route' });
});

module.exports = router;