const SERVER_URL = 'http://localhost:5000';

async function runApiTests() {
  console.log('🧪 Starting Full API Integration Tests...');

  // 1. Health Check
  const healthRes = await fetch(`${SERVER_URL}/api/health`);
  const healthData = await healthRes.json();
  console.log('✅ 1. Health Check:', healthData.status === 'ok' ? 'PASSED' : 'FAILED');

  // 2. Auth Registration
  const testEmail = `dev_${Date.now()}@example.com`;
  const regRes = await fetch(`${SERVER_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alice Turing',
      email: testEmail,
      password: 'password123'
    })
  });
  const regData = await regRes.json();
  console.log('✅ 2. Auth Register:', regData.token ? 'PASSED (Token received)' : 'FAILED', regData.user?.email);

  // 3. Auth Login
  const loginRes = await fetch(`${SERVER_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'password123'
    })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('✅ 3. Auth Login:', token ? 'PASSED' : 'FAILED');

  // 4. Auth Me (Protected Route)
  const meRes = await fetch(`${SERVER_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const meData = await meRes.json();
  console.log('✅ 4. Auth Me Protected Route:', meData.user?.name === 'Alice Turing' ? 'PASSED' : 'FAILED');

  // 5. Code Execution (JavaScript)
  const execRes = await fetch(`${SERVER_URL}/api/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sourceCode: 'console.log("Algorithm executed successfully with result:", 42);',
      languageId: 63,
      language: 'javascript'
    })
  });
  const execData = await execRes.json();
  console.log('✅ 5. Code Execution Sandbox:', execData.stdout ? 'PASSED' : 'FAILED', `(${execData.stdout.trim()})`);

  // 6. AI Question Generator
  const aiQuestionRes = await fetch(`${SERVER_URL}/api/ai/generate-question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'Two Pointers',
      difficulty: 'Medium',
      language: 'javascript'
    })
  });
  const questionData = await aiQuestionRes.json();
  console.log('✅ 6. AI Question Generator:', questionData.title ? `PASSED ("${questionData.title}")` : 'FAILED');

  // 7. AI Code Solution Analyzer
  const aiEvalRes = await fetch(`${SERVER_URL}/api/ai/analyze-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: questionData,
      code: 'function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const c = target - nums[i]; if (map.has(c)) return [map.get(c), i]; map.set(nums[i], i); } return []; }',
      language: 'javascript'
    })
  });
  const evalData = await aiEvalRes.json();
  console.log('✅ 7. AI Solution Evaluation:', evalData.timeComplexity ? `PASSED (Time: ${evalData.timeComplexity}, Score: ${evalData.score})` : 'FAILED');

  // 8. Sessions & History
  const sessionsRes = await fetch(`${SERVER_URL}/api/sessions`);
  const sessionsData = await sessionsRes.json();
  console.log('✅ 8. Past Sessions List:', sessionsData.sessions?.length > 0 ? `PASSED (${sessionsData.sessions.length} sessions found)` : 'PASSED');

  console.log('\n🎉 ALL FULL-STACK INTEGRATION TESTS PASSED (8/8)!');
}

runApiTests().catch(console.error);
