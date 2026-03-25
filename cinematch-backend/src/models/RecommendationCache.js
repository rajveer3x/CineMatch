const mongoose = require('mongoose');

const recommendationCacheSchema = new mongoose.Schema({
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
  explanation: {
    type: String,
    required: true
  },
  profileSnapshot: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // 7 days in seconds (7 * 24 * 60 * 60)
  }
});

// Unique index on { userId, movieId }
recommendationCacheSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const RecommendationCache = mongoose.model('RecommendationCache', recommendationCacheSchema);
module.exports = RecommendationCache;
