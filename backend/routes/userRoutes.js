const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User'); 
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,         
    port: process.env.SMTP_PORT,         
    secure: process.env.SMTP_SECURE === 'true', 
    auth: {
        user: process.env.EMAIL_USER,    
        pass: process.env.EMAIL_PASS     
    }
});


router.post('/signup', async (req, res) => {
    const { email, username, password } = req.body;

    try {
        
        if (!email || !username || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const existingUser = await User.findOne({ user_email: email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        
        const newUser = new User({
            user_email: email,
            user_password: hashedPassword,
            user_role: 'free',             
            user_verid_status: 'pending',  
            user_created_at: new Date(),
            user_updated_at: new Date()
        });

        const savedUser = await newUser.save();
        const verificationToken = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '30m' });
        const verificationLink = `${process.env.VERIFY_LINK}/verify?token=${verificationToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: savedUser.user_email,
            subject: 'Taskspring - Verify your email',
            html: `<p>Welcome to Taskspring. Please verify your email in 30 minutes by clicking <a href="${verificationLink}">here</a>.</p>`
        };

        await transporter.sendMail(mailOptions);
        
        res.status(201).json({ message: 'User registered. Please check your email to verify your account.' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});
router.get('/verify', async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ message: 'No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (user.user_verid_status === 'verified') {
            return res.status(400).json({ message: 'User already verified.' });
        }
        user.user_verid_status = 'verified';
        user.user_updated_at = new Date();
        await user.save();
        return res.redirect(`${process.env.FRONTEND_URL}/dashboard`); //!chnage to sign in first
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            await User.findByIdAndDelete(decoded.id);
            return res.status(400).json({ message: 'Token expired. User account deleted.' });
        }

        return res.status(500).json({ message: 'Error verifying email', error: error.message });
    }
});

router.get('/protected', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization token missing.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized access. User not found.' });
        }

        if (user.user_role !== 'free' && user.user_role !== 'premium') {
            return res.status(403).json({ message: 'Access denied. Insufficient role.' });
        }

        res.status(200).json({ message: 'Access granted to protected route.' });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
    }
});

router.get('/premium', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization token missing.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized access. User not found.' });
        }

        if (user.user_role !== 'premium') {
            return res.status(403).json({ message: 'Access denied. Premium users only.' });
        }

        res.status(200).json({ message: 'Access granted to premium route.' });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
    }
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ user_email: email });
        if (!user) {
            return res.status(404).json({ message: 'Invalid credentials.' });
        }
        const isMatch = await bcrypt.compare(password, user.user_password);
        if (!isMatch) {
            return res.status(404).json({ message: 'Invalid credentials.' });
        }
        if (user.user_verid_status !== 'verified') {
            return res.status(400).json({ message: 'Please verify your email before signing in.' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token, message: 'Login successful.' });
    } catch (error) {
        res.status(500).json({ message: 'Error signing in', error: error.message });
    }
});

module.exports = router;
