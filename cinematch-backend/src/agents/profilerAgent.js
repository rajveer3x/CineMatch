const Rating = require('../models/Rating');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { callLLM } = require('../utils/llmWrapper');

exports.runProfiler = async (userId) => {
  // Step A - Fetch top-rated movies
  const ratings = await Rating.find({ userId, score: { $gte: 4 } })
    .populate({ path: 'movieId', select: 'title genres voteAverage overview' })
    .sort({ score: -1 })
    .limit(20);

  if (ratings.length < 5) {
    throw new AppError('Not enough ratings to build profile', 400);
  }

  // Step B - Build the prompt context
  // Map the results into a clean list string
  const movieList = ratings.map(r => {
    const movie = r.movieId;
    if (!movie) return '';
    const genres = movie.genres && movie.genres.length > 0 ? movie.genres.join(', ') : 'N/A';
    return `Title: ${movie.title} | Genres: ${genres} | Score: ${r.score}`;
  }).filter(line => line !== '').join('\n');

  // Step C - Call the LLM
  const systemPrompt = "You are a film critic AI. Analyse the following movies a user loves and write a concise 2-3 sentence taste profile. Focus on recurring themes, tones, genres, and storytelling styles. Be specific. Output only the profile text, no preamble.";
  
  const userPrompt = `Movies this user rated 4-5 stars:\n${movieList}`;

  const llmResponse = await callLLM({ systemPrompt, userPrompt, maxTokens: 200 });

  // We need to know the current ratingsCount of the user
  const user = await User.findById(userId);
  const currentCount = user ? user.ratingsCount : 0;

  // Step D - Save to user
  await User.findByIdAndUpdate(userId, {
    tasteProfile: llmResponse,
    tasteProfileUpdatedAt: new Date(),
    lastProfileRatingsCount: currentCount
  });

  // Step E - Return the taste profile string
  return llmResponse;
};

exports.shouldRegenerateProfile = (user) => {
  if (!user.tasteProfile) return true;
  const lastCount = user.lastProfileRatingsCount || 0;
  return user.ratingsCount >= lastCount + 3;
};
