require('dotenv').config();
const mongoose = require('mongoose');
const { getSimilarUserRecs } = require('./src/utils/collaborativeFilter');
const User = require('./src/models/User');
const Movie = require('./src/models/Movie');
const Rating = require('./src/models/Rating');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const r1 = Math.floor(Math.random() * 1000000);
  
  // Create 2 test users
  const user1 = await User.create({ username: 'collabA' + r1, email: r1 + 'ca@test.com', password: 'password123', ratingsCount: 5 });
  const user2 = await User.create({ username: 'collabB' + r1, email: r1 + 'cb@test.com', password: 'password123', ratingsCount: 6 });

  // Create 6 movies
  const movies = [];
  for (let i = 0; i < 6; i++) {
      movies.push(await Movie.create({
          tmdbId: r1 * 10 + i,
          title: 'Overlap Movie ' + i,
          genres: ['Comedy']
      }));
  }

  // User 1 sees and rates mostly the first 5 movies highly
  for (let i = 0; i < 5; i++) {
      await Rating.create({ userId: user1._id, movieId: movies[i]._id, score: 5 });
  }

  // User 2 sees all 6 movies, rating the first 5 movies similarly, and gives extremely high praise to the 6th
  for (let i = 0; i < 5; i++) {
      await Rating.create({ userId: user2._id, movieId: movies[i]._id, score: 4 });
  }
  await Rating.create({ userId: user2._id, movieId: movies[5]._id, score: 5 }); // The Rec Target!

  console.log(`Getting recommendations from mathematically similar users for ${user1._id}...`);
  const recs = await getSimilarUserRecs(user1._id);

  console.log('\n--- Collaborative Filtering Results ---');
  console.log(recs);
  console.log('---------------------------------------\n');

  process.exit(0);
}

test().catch(e => { console.error(e); process.exit(1); });
