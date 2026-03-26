const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMe, savePreferences, completeOnboarding } = require('../controllers/userController');

router.use(protect);

router.get('/me', getMe);
router.post('/preferences', savePreferences);
router.post('/complete-onboarding', completeOnboarding);

module.exports = router;
