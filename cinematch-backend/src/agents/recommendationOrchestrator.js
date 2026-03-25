const User = require('../models/User');
const Movie = require('../models/Movie');
const RecommendationFeed = require('../models/RecommendationFeed');
const { runProfiler, shouldRegenerateProfile } = require('./profilerAgent');
const { runMatchmaker } = require('./matchmakerAgent');
const { runCritic } = require('./criticAgent');
const { getSimilarUserRecs } = require('../utils/collaborativeFilter');

exports.getPersonalisedRecommendations = async (userId) => {
  // Step A — Check if profile needs regeneration
  let user = await User.findById(userId).select('tasteProfile ratingsCount lastProfileRatingsCount');
  if (shouldRegenerateProfile(user)) {
    await runProfiler(userId);
    user = await User.findById(userId).select('tasteProfile ratingsCount lastProfileRatingsCount');
  }

  // Step B — Run sources in parallel
  const [aiResult, collabResult] = await Promise.allSettled([
    runMatchmaker(userId).then(movies => runCritic(userId, movies)),
    getSimilarUserRecs(userId)
  ]);

  // Step C — Process results safely
  let aiMovies = [];
  if (aiResult.status === 'fulfilled') {
    aiMovies = aiResult.value;
  } else {
    console.error('AI Recommendation Error:', aiResult.reason);
  }

  let collabRaw = [];
  if (collabResult.status === 'fulfilled') {
    collabRaw = collabResult.value;
  } else {
    console.error('Collab Recommendation Error:', collabResult.reason);
  }

  // Step D — Merge and deduplicate
  const finalAiSet = new Set(aiMovies.map(item => item.movie.tmdbId));
  const uniqueCollabRaw = collabRaw.filter(c => !finalAiSet.has(c.tmdbId));

  // Limit collab batch to 5 for Critic
  const collabTmdbIds = uniqueCollabRaw.slice(0, 5).map(c => c.tmdbId);
  const collabMovieDocs = await Movie.find({ tmdbId: { $in: collabTmdbIds } });
  
  let collabExplained = [];
  if (collabMovieDocs.length > 0) {
    const explainedCollab = await runCritic(userId, collabMovieDocs);
    collabExplained = explainedCollab.map(item => {
      const originalInfo = uniqueCollabRaw.find(r => r.tmdbId === item.movie.tmdbId);
      return {
        source: 'collaborative',
        movie: item.movie,
        explanation: item.explanation, // Actually ran Critic on these per instructions
        weightedScore: originalInfo ? originalInfo.weightedScore : 0
      };
    });
    collabExplained.sort((a, b) => b.weightedScore - a.weightedScore);
  }

  // Combine remaining collab without explanations if any (from index > 5)
  const remainingCollab = uniqueCollabRaw.slice(5).map(c => {
    return {
      source: 'collaborative',
      movie: { tmdbId: c.tmdbId, title: c.title }, // Sparse movie obj, no critic
      explanation: null,
      weightedScore: c.weightedScore
    };
  });

  const allCollab = [...collabExplained, ...remainingCollab];

  const aiExplained = aiMovies.map(item => ({
    source: 'ai',
    movie: item.movie,
    explanation: item.explanation
  }));

  // Step E — Final ranking and interleaving (2 AI, 1 Collab)
  const finalFeed = [];
  let aiIndex = 0;
  let collabIndex = 0;

  while (finalFeed.length < 20 && (aiIndex < aiExplained.length || collabIndex < allCollab.length)) {
    if (aiIndex < aiExplained.length) finalFeed.push(aiExplained[aiIndex++]);
    if (finalFeed.length < 20 && aiIndex < aiExplained.length) finalFeed.push(aiExplained[aiIndex++]);
    if (finalFeed.length < 20 && collabIndex < allCollab.length) finalFeed.push(allCollab[collabIndex++]);
  }

  // Step F — Cache the full result
  await RecommendationFeed.findOneAndUpdate(
    { userId },
    { recommendations: finalFeed, generatedAt: new Date() },
    { upsert: true }
  );

  return finalFeed;
};
