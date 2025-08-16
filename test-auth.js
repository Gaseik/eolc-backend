const jwt = require('jsonwebtoken');

// 測試 JWT middleware 邏輯
const JWT_SECRET = 'dev-secret';

function testJWTMiddleware() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ODYzZjEzZjE1NzE4ZmM2MjI0ZmEwZiIsImVtYWlsIjoibmV3dXNlckBleGFtcGxlLmNvbSIsInJvbGUiOiJtYW51ZmFjdHVyZXIiLCJpYXQiOjE3NTM2Mjg0NDAsImV4cCI6MTc1MzYyOTM0MH0.0pcO3Pv9XsOr_9YC0roSz7bTNOgiY_oguWQauMbTVKw";
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    console.log('JWT Payload:', payload);
    
    // 模擬 middleware 邏輯
    const req = { user: { id: payload.id, email: payload.email, role: payload.role } };
    console.log('Request user object:', req.user);
    console.log('User ID:', req.user.id);
    
  } catch (err) {
    console.error('JWT verification failed:', err);
  }
}

testJWTMiddleware(); 