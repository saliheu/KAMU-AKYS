const express = require('express');
const router = express.Router();

// Placeholder routes
router.get('/', (req, res) => {
  res.json({ message: 'Expenses list endpoint' });
});

module.exports = router;