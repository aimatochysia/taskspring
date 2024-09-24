const express = require('express');
const protect = require('../middleware/authMiddleware');
const { upgradeToPremium, checkSubscriptionStatus } = require('../controllers/subscriptionController');

const router = express.Router();

//upgrader
router.post('/upgrade', protect, upgradeToPremium);

//status checker
router.get('/status', protect, checkSubscriptionStatus);

module.exports = router;
