
const midtransClient = require('midtrans-client');
const Order = require('../models/Order');
const User = require('../models/User');


const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
});


const coreApi = new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
});


const generateOrderId = async () => {
    const latestOrder = await Order.findOne().sort({ created_at: -1 });
    const lastOrderId = latestOrder ? parseInt(latestOrder.order_id.split('-')[1]) : 0;
    return `ORDER-${lastOrderId + 1}`;
};


const getPaymentDetails = (paymentType) => {
    const paymentOptions = {
        monthly: {
            grossAmount: 45000,
            duration: 30, 
        },
        yearly: {
            grossAmount: 450000,
            duration: 365, 
        },
    };
    return paymentOptions[paymentType];
};


const createSnapTransaction = async (req, res) => {
    const { paymentType } = req.body; 

    if (!paymentType || !['monthly', 'yearly'].includes(paymentType)) {
        return res.status(400).json({ message: 'Invalid or missing payment type.' });
    }

    try {
        const paymentDetails = getPaymentDetails(paymentType);
        const orderId = await generateOrderId(); 

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: paymentDetails.grossAmount,
            },
            customer_details: {
                email: req.user.user_email, 
            },
            credit_card: {
                secure: true,
            },
        };

        const transaction = await snap.createTransaction(parameter);

        
        await Order.create({
            order_id: orderId,
            user_email: req.user.user_email,
            gross_amount: paymentDetails.grossAmount,
            transaction_status: 'pending',
            transaction_time: new Date(),
            payment_type: paymentType,
        });

        res.status(200).json({
            redirectUrl: transaction.redirect_url,
        });
    } catch (error) {
        console.error('Midtrans error:', error);
        res.status(500).json({
            message: 'Failed to create Snap transaction.',
            error: error.message,
        });
    }
};


const handleNotification = async (req, res) => {
    try {
        const notification = await coreApi.transaction.notification(req.body);

        const {
            order_id,
            transaction_status,
            payment_type,
            gross_amount,
        } = notification;

        
        const order = await Order.findOne({ order_id });

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        
        order.transaction_status = transaction_status;
        order.payment_type = payment_type;
        order.gross_amount = gross_amount;
        await order.save();

        
        if (transaction_status === 'settlement' || transaction_status === 'capture') {
            const user = await User.findOne({ user_email: order.user_email });

            if (user) {
                const paymentDetails = getPaymentDetails(order.payment_type);

                
                user.user_role = 'premium';
                const currentEndDate = user.user_sub_end_date || new Date();
                user.user_sub_end_date = new Date(currentEndDate.getTime() + paymentDetails.duration * 24 * 60 * 60 * 1000);
                await user.save();
            }
        }

        res.status(200).json({ message: 'Notification processed successfully.' });
    } catch (error) {
        console.error('Error processing Midtrans notification:', error);
        res.status(500).json({ message: 'Failed to process notification.', error: error.message });
    }
};

module.exports = { createSnapTransaction, handleNotification };
