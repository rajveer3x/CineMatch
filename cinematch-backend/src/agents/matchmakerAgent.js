const User = require('../models/User');
const Rating = require('../models/Rating');
const Watchlist = require('../models/Watchlist');
const { runProfiler } = require('./profilerAgent');
const { callLLM } = require('../utils/llmWrapper');
const { discoverMovies } = require('../utils/tmdbClient');
const { saveMovieToCache } = require('../utils/movieCache');

exports.runMatchmaker = async (userId) => {
  // Step A — Get the user's taste profile
  let user = await User.findById(userId).select('tasteProfile');
  if (!user.tasteProfile) {
    await runProfiler(userId);
    user = await User.findById(userId).select('tasteProfile');
  }

  // Step B — Ask the LLM for TMDB genre IDs and keywords
  const systemPrompt = "You are a movie recommendation engine. Given a user taste profile, output ONLY a valid JSON object with these fields: { genreIds: number[], keywords: string[], minVoteAverage: number, maxPopularity: number }. Use TMDB genre IDs. genreIds should have 2-3 values. keywords should have 3-5 specific thematic terms. minVoteAverage between 6.5 and 8.0. maxPopularity between 15 and 40 to find underrated films. No explanation, only JSON.";
  const userPrompt = `User taste profile: ${user.tasteProfile}`;
  
  const llmResponseText = await callLLM({ systemPrompt, userPrompt, maxTokens: 150 });

  // Step C — Parse and validate the JSON
  let paramsObj;
  try {
    paramsObj = JSON.parse(llmResponseText);
    if (!Array.isArray(paramsObj.genreIds) || !Array.isArray(paramsObj.keywords)) {
      throw new Error("Invalid arrays in JSON");
    }
  } catch (err) {
    paramsObj = { genreIds: [18, 878], keywords: [], minVoteAverage: 7.0, maxPopularity: 30 };
  }

  // Step D — Call TMDB /discover/movie
  const discoverParams = {
    with_genres: paramsObj.genreIds.join(','),
    'vote_average.gte': paramsObj.minVoteAverage,
    'popularity.lte': paramsObj.maxPopularity,
    'vote_count.gte': 200,
    sort_by: 'vote_average.desc',
    page: 1
  };

  const tmdbResponse = await discoverMovies(discoverParams);
  const rawMovies = tmdbResponse.results || [];

  // Step E — Filter out already-rated and already-watchlisted movies
  const rated = await Rating.find({ userId }).populate('movieId', 'tmdbId');
  const watchlisted = await Watchlist.find({ userId }).populate('movieId', 'tmdbId');

  const excludeTmdbIds = new Set();
  rated.forEach(r => { if (r.movieId) excludeTmdbIds.add(r.movieId.tmdbId); });
  watchlisted.forEach(w => { if (w.movieId) excludeTmdbIds.add(w.movieId.tmdbId); });

  const candidates = rawMovies.filter(m => !excludeTmdbIds.has(m.id)).slice(0, 15);

  // Step F — Save all candidate movies to the Movie cache
  const resultMovies = [];
  for (const candidate of candidates) {
    const cachedMovie = await saveMovieToCache(candidate);
    resultMovies.push(cachedMovie);
  }

  return resultMovies;
};
