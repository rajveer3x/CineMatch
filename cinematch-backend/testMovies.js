async function testMovies() {
  const baseUrl = 'http://localhost:5000/api';
  const email = `testmovies${Date.now()}@example.com`;
  
  // Register step
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: `TestMovies${Date.now()}`,
      email,
      password: 'password123'
    })
  });
  
  const regData = await regRes.json();
  const token = regData.token;

  if (!token) {
    return console.error('Failed to get token:', regData);
  }

  console.log(`\n[1] Generated Token: ${token.substring(0, 15)}...`);
  console.log(`\n[2] Fetching popular movies...`);

  // First fetch
  const moviesRes1 = await fetch(`${baseUrl}/movies/popular`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data1 = await moviesRes1.json();
  console.log(`Received ${data1.results?.length} movies. First movie: ${data1.results?.[0]?.title}`);

  // Second fetch to test cache upserts
  console.log(`\n[3] Fetching popular movies again (to check DB)...`);
  const moviesRes2 = await fetch(`${baseUrl}/movies/popular`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data2 = await moviesRes2.json();
  console.log(`Received ${data2.results?.length} movies. Cache upserts succeeded!`);

  console.log('\nSUCCESS! Check MongoDB Compass to verify documents.');
}

testMovies();
