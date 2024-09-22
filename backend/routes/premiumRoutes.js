const express = require('express');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/premium-feature', protect, roleMiddleware('premium'), (req, res) => {
  res.json({ message: 'Welcome to premium features' });
});

module.exports = router;
