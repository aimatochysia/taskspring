const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-user_password');
      next();
    } catch (err) {
      return res.status(401).send('Not authorized, token failed');
    }
  }

  if (!token) return res.status(401).send('Not authorized, no token');
};
const premiumOnly = (req, res, next) => {
  if (req.user.user_role !== 'premium') return res.status(403).send('Access restricted to premium users.');
  next();
};

module.exports = { protect, premiumOnly };
