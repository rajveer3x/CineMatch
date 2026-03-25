const Rating = require('../models/Rating');
const User = require('../models/User');
const RecommendationCache = require('../models/RecommendationCache');
const { callLLM } = require('../utils/llmWrapper');

exports.runCritic = async (userId, candidateMovies) => {
  // Step A — Load the user's top 3 favourite movies
  const favRatings = await Rating.find({ userId, score: 5 })
    .populate('movieId', 'title')
    .sort({ createdAt: -1 })
    .limit(3);

  const favTitles = favRatings
    .filter(r => r.movieId)
    .map(r => r.movieId.title)
    .join(', ');

  const user = await User.findById(userId).select('tasteProfile');
  const profileSnapshot = user.tasteProfile ? user.tasteProfile.slice(0, 100) : '';

  // Step B — Check existing explanations cache
  const candidateIds = candidateMovies.map(m => m._id);
  const existingCache = await RecommendationCache.find({
    userId,
    movieId: { $in: candidateIds }
  });

  const cacheMap = new Map();
  existingCache.forEach(cacheObj => {
    cacheMap.set(cacheObj.movieId.toString(), cacheObj.explanation);
  });

  const uncachedMovies = candidateMovies.filter(m => !cacheMap.has(m._id.toString()));

  // Step C & D — For each candidate NOT in cache, generate explanation in batches of 5
  // Note: we can map the LLM calls to Promises to process in batches.
  const batchSize = 5;
  for (let i = 0; i < uncachedMovies.length; i += batchSize) {
    const batch = uncachedMovies.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (movie) => {
      const genresStr = movie.genres && movie.genres.length > 0 ? movie.genres.join(', ') : 'unknown';
      const overviewStr = movie.overview ? movie.overview.slice(0, 150) : '';
      
      const systemPrompt = "You are a witty film recommender. Write exactly ONE sentence (max 20 words) explaining why this user will love this film. Reference their taste directly. Be specific, not generic. No preamble.";
      const userPrompt = `User loves: ${favTitles}\nRecommended film: ${movie.title} (${genresStr})\nFilm overview: ${overviewStr}`;
      
      try {
        const explanation = await callLLM({ systemPrompt, userPrompt, maxTokens: 60 });
        
        // Save to cache
        await RecommendationCache.findOneAndUpdate(
          { userId, movieId: movie._id },
          { explanation, profileSnapshot, createdAt: new Date() },
          { upsert: true, new: true }
        );
        
        cacheMap.set(movie._id.toString(), explanation);
      } catch (err) {
        console.error(`Failed to generate explanation for movie ${movie.title}:`, err);
        // Fallback explanation if LLM fails
        cacheMap.set(movie._id.toString(), `A great match based on your taste profile.`);
      }
    });

    await Promise.all(batchPromises);
  }

  // Step E — Return array of { movie, explanation }
  return candidateMovies.map(m => ({
    movie: m,
    explanation: cacheMap.get(m._id.toString()) || `A highly recommended title for you.`
  }));
};

exports.clearStaleCache = async (userId) => {
  const user = await User.findById(userId).select('tasteProfile');
  const profileSnapshot = user && user.tasteProfile ? user.tasteProfile.slice(0, 100) : '';
  
  if (profileSnapshot) {
    // Delete entries where profileSnapshot does not match
    await RecommendationCache.deleteMany({
      userId,
      profileSnapshot: { $ne: profileSnapshot }
    });
  }
};
