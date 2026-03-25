const RecommendationFeed = require('../models/RecommendationFeed');
const { getPersonalisedRecommendations } = require('../agents/recommendationOrchestrator');
const AppError = require('../utils/AppError');

exports.getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const feed = await RecommendationFeed.findOne({ userId });

    // Assuming 6 hours cache (6 * 60 * 60 * 1000)
    if (feed && (Date.now() - new Date(feed.generatedAt).getTime() < 6 * 60 * 60 * 1000)) {
      return res.status(200).json({ success: true, cached: true, generatedAt: feed.generatedAt, data: feed.recommendations });
    }

    const freshResults = await getPersonalisedRecommendations(userId);
    res.status(200).json({ success: true, cached: false, generatedAt: new Date(), data: freshResults });
  } catch (err) {
    next(err);
  }
};

exports.refreshRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const freshResults = await getPersonalisedRecommendations(userId);
    res.status(200).json({ success: true, generatedAt: new Date(), data: freshResults });
  } catch (err) {
    next(err);
  }
};
