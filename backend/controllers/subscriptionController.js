const User = require('../models/userModel');

//calculate expiration date
const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

//upgrade user to premium
exports.upgradeToPremium = async (req, res) => {
  const { plan } = req.body;
  
  if (!plan || !['monthly', 'annual'].includes(plan)) {
    return res.status(400).json({ message: 'Invalid plan selected' });
  }

  try {
    const user = req.user;
    const now = new Date();
    const expirationDate = plan === 'monthly' ? addMonths(now, 1) : addMonths(now, 12);

    //upgrader
    user.role = 'premium';
    user.subscriptionExpires = expirationDate;

    await user.save();

    res.json({
      message: 'Subscription successful',
      plan,
      subscriptionExpires: user.subscriptionExpires,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//check subscription status
exports.checkSubscriptionStatus = async (req, res) => {
  const user = req.user;
  const now = new Date();

  try {
    if (user.role === 'premium' && user.subscriptionExpires < now) {
      //downgrader if expired
      user.role = 'free';
      user.subscriptionExpires = null;
      await user.save();
    }

    res.json({
      message: 'Subscription status checked',
      role: user.role,
      subscriptionExpires: user.subscriptionExpires,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
