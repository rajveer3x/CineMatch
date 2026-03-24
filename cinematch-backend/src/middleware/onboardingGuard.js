const AppError = require('../utils/AppError');

const onboardingGuard = (req, res, next) => {
  if (!req.user.onboardingComplete) {
    return res.status(403).json({
      message: 'Please complete onboarding first',
      redirectTo: '/onboarding'
    });
  }
  next();
};

module.exports = onboardingGuard;
