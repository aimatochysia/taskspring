const express = require('express');
const { signup, signin } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);

module.exports = router;
