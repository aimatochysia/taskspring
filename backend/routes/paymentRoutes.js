const express = require('express');
const { createSnapTransaction, handleNotification } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/snap', protect, createSnapTransaction);
router.post('/notification', handleNotification);
module.exports = router;