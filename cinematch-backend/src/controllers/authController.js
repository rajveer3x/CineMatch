const User = require('../models/User');
const AppError = require('../utils/AppError');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const register = async (req, res, next) => {
  // Validate: username, email, password are present (use express-validator)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  // Check if email already exists in User model
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already in use', 409);
  }

  // Hash password
  const saltRounds = Number(process.env.BCRYPT_ROUNDS) || 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user in DB (never save raw password)
  const user = await User.create({
    username,
    email,
    password: hashedPassword
  });

  // Sign a JWT
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  // Return token and user details
  res.status(201).json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      onboardingComplete: user.onboardingComplete
    }
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  // Find user by email using .select('+password') — password is excluded by default
  const user = await User.findOne({ email }).select('+password');

  // If no user OR bcrypt.compare fails → same generic error: AppError('Invalid credentials', 401)
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid credentials', 401);
  }

  // Sign and return JWT same as register
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.status(200).json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      onboardingComplete: user.onboardingComplete
    }
  });
};

module.exports = {
  register,
  login
};
