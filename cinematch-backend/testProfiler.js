require('dotenv').config();
const mongoose = require('mongoose');
const { runProfiler } = require('./src/agents/profilerAgent');
const User = require('./src/models/User');
const Movie = require('./src/models/Movie');
const Rating = require('./src/models/Rating');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // create clean state user
  const r = Math.floor(Math.random() * 1000000);
  const user = await User.create({ username: 'tu' + r, email: 'tu' + r + '@test.com', password: 'password123', ratingsCount: 5 });
  
  // create 5 brand new movies
  const movies = [];
  for (let i = 0; i < 5; i++) {
      movies.push(await Movie.create({
          tmdbId: r + i * 10,
          title: 'Test Movie ' + i,
          genres: ['Drama', 'Thriller']
      }));
  }

  // create 5 ratings
  for (let i = 0; i < 5; i++) {
      await Rating.create({
          userId: user._id,
          movieId: movies[i]._id,
          score: 5
      });
  }

  const profile = await runProfiler(user._id);
  console.log('SUCCESS-PROFILE-START');
  console.log(profile);
  console.log('SUCCESS-PROFILE-END');
  process.exit(0);
}

test().catch(e => { console.error(e); process.exit(1); });
