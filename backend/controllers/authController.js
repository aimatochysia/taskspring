const User = require('../models/userModel');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');  // Utility to send emails
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    //check if user exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    //create user unverified
    const user = await User.create({
      name,
      email,
      password,
    });

    //generate email token
    const verificationToken = user.generateVerificationToken();
    await user.save();  // Save user with token

    //send email verif
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
    const message = `
      Hi ${name},
      Please click the link below to verify your email address:
      ${verificationUrl}
      If you did not request this, please ignore this email.
    `;

    await sendEmail({
      to: user.email,
      subject: 'Email Verification',
      text: message,
    });

    res.status(201).json({
      message: 'Sign up successful. Please check your email to verify your account.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during sign up', error: error.message });
  }
};


//verify email via token
exports.verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        //hash token to match database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        //find user with matching token & has not expired
        const user = await User.findOne({
        verificationToken: hashedToken,
        verificationTokenExpires: { $gt: Date.now() },  //validate token
        });

        if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
        }

        //mark user verified after, and delete verif token
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: 'Email verification failed', error: error.message });
    }
};

  exports.signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
        }

        //check if user verified
        if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your email before logging in.' });
        }

        //create jwt token if verified
        const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
        );

        res.json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};
