const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const sendVerificationEmail = require('../utils/email');

exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      //check if verified
      if (!user.isVerified) {
        return res.status(403).json({ message: 'Please verify your email before logging in' });
      }
  
      //generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  };

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    //create unverified user
    const user = await User.create({ name, email, password, isVerified: false });

    //JWT token generation
    const verificationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } //token expiry
    );

    //send verification email
    const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${verificationToken}`;
    const emailText = `Hello ${user.name},\n\nPlease verify your email by clicking the link below:\n\n${verificationUrl}\n\nThank you!`;

    await sendVerificationEmail(user.email, 'Email Verification', emailText);

    res.status(201).json({ message: 'Signup successful, please verify your email' });
  } catch (error) {
    res.status(500).json({ message: 'Error during signup', error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
    const { token } = req.query;
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ email: decoded.email });
  
      if (!user) {
        return res.status(400).json({ message: 'Invalid token' });
      }
      user.isVerified = true;
      await user.save();
  
      res.status(200).json({ message: 'Email verified, you can now log in' });
    } catch (error) {
      res.status(500).json({ message: 'Email verification failed', error: error.message });
    }
  };