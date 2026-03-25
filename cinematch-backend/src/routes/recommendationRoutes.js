const express = require('express');
const router = express.Router();
const { getRecommendations, refreshRecommendations } = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');
const onboardingGuard = require('../middleware/onboardingGuard');
const rateLimit = require('express-rate-limit');

const refreshLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each user to 3 requests per windowMs
  message: { message: 'Too many refresh requests, please try again after an hour' },
  keyGenerator: (req) => {
    return req.user._id.toString();
  }
});

router.use(protect);
router.use(onboardingGuard);

router.get('/', getRecommendations);
router.post('/refresh', refreshLimiter, refreshRecommendations);

module.exports = router;
