const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_email: { type: String, required: true, unique: true },
  user_password: { type: String, required: true },
  user_role: { type: String, enum: ['free', 'premium'], default: 'free' },
  user_verid_status: { type: String, default: 'pending' },
  user_sub_end_date: { type: Date, default: null },
  user_created_at: { type: Date, default: Date.now },
  user_updated_at: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
