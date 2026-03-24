

async function testAuth() {
  const baseUrl = 'http://localhost:5000/api/auth';
  const email = `testuser${Date.now()}@example.com`;
  
  console.log(`[1] Registering with ${email}...`);
  const regRes = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: `TestUser${Date.now()}`,
      email,
      password: 'password123'
    })
  });
  
  const regData = await regRes.json();
  console.log('Register Response:', regRes.status, regData);
  
  if (regRes.status !== 201) return console.error('Register failed');

  console.log(`\n[2] Logging in with ${email}...`);
  const loginRes = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'password123'
    })
  });
  
  const loginData = await loginRes.json();
  console.log('Login Response:', loginRes.status, loginData);
  
  if (loginData.token) {
    console.log('\nSUCCESS! Token received:', loginData.token.substring(0, 20) + '...');
  }
}

testAuth();
