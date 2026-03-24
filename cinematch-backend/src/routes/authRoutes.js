const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { strictRateLimiter } = require('../middleware/rateLimiter');
const { body } = require('express-validator');

// Validation rules
const registerValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', strictRateLimiter, registerValidation, register);
router.post('/login', strictRateLimiter, loginValidation, login);

module.exports = router;
