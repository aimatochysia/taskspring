const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    order_id: { type: String, required: true, unique: true },
    user_email: { type: String, required: true },
    gross_amount: { type: Number, required: true },
    transaction_status: { type: String, default: 'pending' },
    transaction_time: { type: Date, default: Date.now },
    payment_type: { type: String, enum: ['monthly', 'yearly'], required: true },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
