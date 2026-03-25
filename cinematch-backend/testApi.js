const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // 1. Get or create an onboarded user with enough ratings
  let user = await User.findOne({ username: 'apiTester' });
  if (!user) {
    user = await User.create({ 
      username: 'apiTester', 
      email: 'apitester@test.com', 
      password: 'password123', 
      onboardingComplete: true, 
      ratingsCount: 6 
    });
  } else {
    user.onboardingComplete = true;
    user.ratingsCount = Math.max(user.ratingsCount, 6);
    await user.save();
  }
  
  // Seed some ratings for them if missing
  const Rating = require('./src/models/Rating');
  const Movie = require('./src/models/Movie');
  const movies = await Movie.find().limit(6);
  for (let i = 0; i < 5; i++) {
    try { await Rating.create({ userId: user._id, movieId: movies[i]._id, score: 5 }); } catch(e){}
  }

  // 2. Generate a valid token
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // 3. Make GET /api/recommendations
  console.log('Fetching recommendations (Fresh call)...');
  const start1 = Date.now();
  const res1 = await axios.get('http://localhost:5000/api/recommendations', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`First call completed in ${Date.now() - start1}ms. Cached: ${res1.data.cached}. Results: ${res1.data.data.length}`);

  // 4. Make GET /api/recommendations again
  console.log('\nFetching recommendations (Cached call)...');
  const start2 = Date.now();
  const res2 = await axios.get('http://localhost:5000/api/recommendations', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`Second call completed in ${Date.now() - start2}ms. Cached: ${res2.data.cached}. Results: ${res2.data.data.length}`);

  console.log('\nTest complete and successful.');
  process.exit(0);
}
test().catch(e => { console.error(e.response ? e.response.data : e.message); process.exit(1); });
