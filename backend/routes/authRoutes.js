const express = require('express');
const { signup, signin, verifyEmail } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/verify-email/:token', verifyEmail);

module.exports = router;
