const jwt = require('jsonwebtoken');

// 從 curl 輸出中複製的 token
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ODYzZjEzZjE1NzE4ZmM2MjI0ZmEwZiIsImVtYWlsIjoibmV3dXNlckBleGFtcGxlLmNvbSIsInJvbGUiOiJtYW51ZmFjdHVyZXIiLCJpYXQiOjE3NTM2Mjg0NDAsImV4cCI6MTc1MzYyOTM0MH0.0pcO3Pv9XsOr_9YC0roSz7bTNOgiY_oguWQauMbTVKw";

try {
  const payload = jwt.verify(token, 'dev-secret');
  console.log('JWT Payload:', payload);
  console.log('Payload ID:', payload.id);
  console.log('Payload keys:', Object.keys(payload));
} catch (err) {
  console.error('JWT verification failed:', err);
} 