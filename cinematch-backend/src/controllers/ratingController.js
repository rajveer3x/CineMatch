const Rating = require('../models/Rating');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { getOrFetchMovie } = require('../utils/movieCache');

const rateMovie = async (req, res, next) => {
  const { tmdbId, score } = req.body;

  // Validate score
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    throw new AppError('Score must be an integer between 1 and 5', 400);
  }

  // Validate tmdbId
  if (!tmdbId || isNaN(Number(tmdbId))) {
    throw new AppError('tmdbId must be a valid number', 400);
  }

  // Ensure the movie exists in DB (fetch from TMDB if needed)
  const movie = await getOrFetchMovie(Number(tmdbId));

  // Upsert the rating
  const rating = await Rating.findOneAndUpdate(
    { userId: req.user._id, movieId: movie._id },
    { score },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  // Only increment ratingsCount if this was a NEW rating (not an update)
  // When upsert creates a new doc, createdAt and updatedAt are essentially the same
  const isNewRating = rating.createdAt.getTime() === rating.updatedAt.getTime();
  if (isNewRating) {
    await User.findByIdAndUpdate(req.user._id, { $inc: { ratingsCount: 1 } });
  }

  res.status(200).json({ message: 'Rating saved', rating });
};

const getUserRatings = async (req, res, next) => {
  const ratings = await Rating.find({ userId: req.user._id })
    .populate('movieId', 'title posterPath tmdbId')
    .sort({ createdAt: -1 });

  res.status(200).json(ratings);
};

const deleteRating = async (req, res, next) => {
  const { id } = req.params;

  // Always verify ownership
  const rating = await Rating.findOneAndDelete({
    _id: id,
    userId: req.user._id
  });

  if (!rating) {
    throw new AppError('Rating not found', 404);
  }

  // Decrement user's ratingsCount
  await User.findByIdAndUpdate(req.user._id, { $inc: { ratingsCount: -1 } });

  res.status(200).json({ message: 'Rating deleted' });
};

module.exports = {
  rateMovie,
  getUserRatings,
  deleteRating
};
