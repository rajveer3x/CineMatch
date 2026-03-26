const User = require('../models/User');
const Rating = require('../models/Rating');
const RecommendationFeed = require('../models/RecommendationFeed');
const AppError = require('../utils/AppError');
const { getOrFetchMovie } = require('../utils/movieCache');

const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

const savePreferences = async (req, res, next) => {
  const rawMovieIds = req.body?.movieIds;

  if (!Array.isArray(rawMovieIds)) {
    throw new AppError('movieIds must be an array of TMDB IDs', 400);
  }

  const movieIds = [...new Set(
    rawMovieIds
      .map((movieId) => Number(movieId))
      .filter((movieId) => Number.isInteger(movieId) && movieId > 0)
  )];

  if (movieIds.length < 5) {
    throw new AppError('Select at least 5 movies to continue', 400);
  }

  if (movieIds.length > 15) {
    throw new AppError('Select no more than 15 movies', 400);
  }

  const cachedMovies = await Promise.all(
    movieIds.map((movieId) => getOrFetchMovie(movieId))
  );

  for (const movie of cachedMovies) {
    await Rating.findOneAndUpdate(
      { userId: req.user._id, movieId: movie._id },
      { score: 5 },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }

  const ratingsCount = await Rating.countDocuments({ userId: req.user._id });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      onboardingComplete: true,
      preferenceMovieIds: movieIds,
      ratingsCount
    },
    { new: true }
  );

  await RecommendationFeed.findOneAndDelete({ userId: req.user._id });

  res.status(200).json(user);
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
  savePreferences,
  completeOnboarding
};
