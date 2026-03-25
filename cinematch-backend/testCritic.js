require('dotenv').config();
const mongoose = require('mongoose');
const { runCritic } = require('./src/agents/criticAgent');
const User = require('./src/models/User');
const Movie = require('./src/models/Movie');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Find a user or create if not exist
  let user = await User.findOne();
  if (!user) {
    user = await User.create({ username: 'criticUser2', email: 'critic@test.com', password: 'password123' });
  }

  // Get 3 random movies
  const movies = await Movie.find().limit(3);
  if (movies.length < 3) {
    console.log("Not enough movies in test DB.");
    process.exit(1);
  }

  console.log(`Testing critic for user ${user._id} with ${movies.length} movies...`);

  // Run critic agent
  const results = await runCritic(user._id, movies);

  console.log('\n--- Critic Explanations ---\n');
  results.forEach((item, index) => {
    console.log(`Movie ${index + 1}: ${item.movie.title}`);
    console.log(`Explanation: ${item.explanation}\n`);
  });
  console.log('---------------------------\n');
  
  process.exit(0);
}

test().catch(e => { console.error(e); process.exit(1); });
