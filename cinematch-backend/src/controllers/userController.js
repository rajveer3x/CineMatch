const User = require('../models/User');
const Rating = require('../models/Rating');
const AppError = require('../utils/AppError');

const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

const completeOnboarding = async (req, res, next) => {
  const ratingsCount = await Rating.countDocuments({ userId: req.user._id });

  if (ratingsCount < 5) {
    throw new AppError('Rate at least 5 movies to continue', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { onboardingComplete: true },
    { new: true }
  );

  res.status(200).json(user);
};

module.exports = {
  getMe,
  completeOnboarding
};
