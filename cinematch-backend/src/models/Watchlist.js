const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  status: {
    type: String,
    enum: ['to-watch', 'watched'],
    default: 'to-watch'
  }
}, { timestamps: true });

// Unique compound index so one user can't have duplicate movie entries
watchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const Watchlist = mongoose.model('Watchlist', watchlistSchema);
module.exports = Watchlist;
