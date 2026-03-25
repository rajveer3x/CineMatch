const mongoose = require('mongoose');
const Rating = require('../models/Rating');
const Movie = require('../models/Movie');

exports.getSimilarUserRecs = async (userId) => {
  // Step A — Get current user's ratings as a map
  const userRatingsList = await Rating.find({ userId });
  if (userRatingsList.length < 5) return [];

  const userA = {};
  userRatingsList.forEach(r => {
    userA[r.movieId.toString()] = r.score;
  });
  
  const userMovieIds = Object.keys(userA);
  const userObjIds = userMovieIds.map(id => new mongoose.Types.ObjectId(id));

  // Step B — Find candidate similar users
  const candidates = await Rating.aggregate([
    { $match: { movieId: { $in: userObjIds }, userId: { $ne: new mongoose.Types.ObjectId(userId) } } },
    { $group: { _id: '$userId', sharedCount: { $sum: 1 } } },
    { $match: { sharedCount: { $gte: 3 } } },
    { $limit: 50 }
  ]);

  if (candidates.length === 0) return [];

  // Step C — Calculate cosine similarity for each candidate
  const magA = Math.sqrt(Object.values(userA).reduce((s, v) => s + v * v, 0));
  const similarUsers = [];

  for (const cand of candidates) {
    const candRatingsList = await Rating.find({ userId: cand._id });
    const userB = {};
    candRatingsList.forEach(r => userB[r.movieId.toString()] = r.score);

    let dotProduct = 0;
    for (const movieId of userMovieIds) {
      if (userB[movieId]) {
        dotProduct += userA[movieId] * userB[movieId];
      }
    }

    const magB = Math.sqrt(Object.values(userB).reduce((s, v) => s + v * v, 0));
    const similarity = dotProduct / (magA * magB);

    if (similarity > 0.6) {
      similarUsers.push({ userId: cand._id, similarity, ratings: candRatingsList });
    }
  }

  similarUsers.sort((a, b) => b.similarity - a.similarity);
  const topSimilar = similarUsers.slice(0, 10);

  // Step D — Collect recommendations from similar users
  const recMap = new Map();

  for (const simUser of topSimilar) {
    // get their 4-5 star rated movies
    const goodRatings = simUser.ratings.filter(r => r.score >= 4);
    
    for (const r of goodRatings) {
      const movieIdStr = r.movieId.toString();
      // Exclude completely if current user has it
      if (!userA[movieIdStr]) {
        const weightedScore = simUser.similarity * r.score;
        if (recMap.has(movieIdStr)) {
          const current = recMap.get(movieIdStr);
          current.weightedScore += weightedScore;
        } else {
          recMap.set(movieIdStr, { movieId: r.movieId, weightedScore });
        }
      }
    }
  }

  // Gather unique movies to lookup details natively
  const results = [];
  for (const entry of recMap.values()) {
    const movie = await Movie.findById(entry.movieId);
    if (movie) {
      results.push({
        tmdbId: movie.tmdbId,
        title: movie.title,
        weightedScore: entry.weightedScore
      });
    }
  }

  // Sort correctly and return top 10
  return results.sort((a, b) => b.weightedScore - a.weightedScore).slice(0, 10);
};
