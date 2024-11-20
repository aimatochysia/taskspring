const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
dotenv.config();
const app = express();
app.use(helmet());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/payments', paymentRoutes);
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});