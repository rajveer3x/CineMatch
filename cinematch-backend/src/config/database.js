const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const options = {
            autoIndex: false // safe for production
        };

        await mongoose.connect(process.env.MONGODB_URI, options);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;

mongoose.connection.on('error', err => console.error('DB error:', err));
