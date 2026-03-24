const Watchlist = require('../models/Watchlist');
const AppError = require('../utils/AppError');
const { getOrFetchMovie } = require('../utils/movieCache');

const VALID_STATUSES = ['to-watch', 'watched'];

const addToWatchlist = async (req, res, next) => {
  const { tmdbId, status = 'to-watch' } = req.body;

  if (!tmdbId || isNaN(Number(tmdbId))) {
    throw new AppError('tmdbId must be a valid number', 400);
  }

  if (!VALID_STATUSES.includes(status)) {
    throw new AppError('Status must be "to-watch" or "watched"', 400);
  }

  const movie = await getOrFetchMovie(Number(tmdbId));

  const entry = await Watchlist.findOneAndUpdate(
    { userId: req.user._id, movieId: movie._id },
    { status },
    { upsert: true, new: true, runValidators: true }
  );

  res.status(200).json({ message: 'Watchlist updated', entry });
};

const getMyWatchlist = async (req, res, next) => {
  const filter = { userId: req.user._id };

  if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
    filter.status = req.query.status;
  }

  const entries = await Watchlist.find(filter)
    .populate('movieId', 'title posterPath genres voteAverage tmdbId')
    .sort({ createdAt: -1 });

  res.status(200).json(entries);
};

const removeFromWatchlist = async (req, res, next) => {
  const { id } = req.params;

  const entry = await Watchlist.findOneAndDelete({
    _id: id,
    userId: req.user._id
  });

  if (!entry) {
    throw new AppError('Watchlist entry not found', 404);
  }

  res.status(200).json({ message: 'Removed from watchlist' });
};

const updateStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    throw new AppError('Status must be "to-watch" or "watched"', 400);
  }

  const entry = await Watchlist.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { status },
    { new: true, runValidators: true }
  );

  if (!entry) {
    throw new AppError('Watchlist entry not found', 404);
  }

  res.status(200).json(entry);
};

module.exports = {
  addToWatchlist,
  getMyWatchlist,
  removeFromWatchlist,
  updateStatus
};
