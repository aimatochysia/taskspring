
const Order = require('../models/Order');


const generateOrderId = async () => {
    const latestOrder = await Order.findOne().sort({ created_at: -1 }); 
    const lastOrderId = latestOrder ? parseInt(latestOrder.order_id.split('-')[1]) : 0;
    const newOrderId = `ORDER-${lastOrderId + 1}`;
    return newOrderId;
};


const createOrder = async (req, res) => {
    const { user_email, gross_amount, payment_email } = req.body;

    if (!user_email || !gross_amount) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const order_id = await generateOrderId(); 

        
        const newOrder = await Order.create({
            order_id,
            user_email,
            gross_amount,
            payment_email,
            payment_type: 'pending',
            transaction_status: 'pending',
            transaction_time: new Date(),
        });

        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
};
