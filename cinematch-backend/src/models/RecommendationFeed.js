const mongoose = require('mongoose');

const recommendationFeedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  recommendations: {
    type: Array, // Array of detailed recommendation objects
    default: []
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

const RecommendationFeed = mongoose.model('RecommendationFeed', recommendationFeedSchema);
module.exports = RecommendationFeed;
