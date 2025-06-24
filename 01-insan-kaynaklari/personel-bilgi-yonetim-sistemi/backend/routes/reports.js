const router = require('express').Router();
const { authenticate } = require('../middleware/auth');

// Placeholder route
router.get('/', authenticate, (req, res) => {
  res.json({ message: 'Reports endpoint - To be implemented' });
});

module.exports = router;