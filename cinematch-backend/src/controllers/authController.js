const User = require('../models/User');
const AppError = require('../utils/AppError');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const formatValidationErrors = (errors) =>
  errors.array().map((error) => error.msg).join(', ');

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: formatValidationErrors(errors) });
    }

    const { username, email, password } = req.body;

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      throw new AppError('Email already in use', 409);
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      throw new AppError('Username already in use', 409);
    }

    const saltRounds = Number(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        onboardingComplete: user.onboardingComplete
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: formatValidationErrors(errors) });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid credentials', 401);
    }

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
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login
};
