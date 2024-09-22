const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());


const authRoutes = require('./routes/authRoutes');
const premiumRoutes = require('./routes/premiumRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/premium', premiumRoutes);

//init port 300 for testing
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
