const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    const user = await User.findOne().sort({ createdAt: -1 }).select('+password');
    if (user) {
      console.log('Latest User:', {
        email: user.email,
        password: user.password
      });
      console.log('Is Password Hashed?', user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));
    } else {
      console.log('No users found.');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
