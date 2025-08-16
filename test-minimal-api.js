const http = require('http');

function testMinimalApi() {
  console.log('=== Testing Minimal API ===');
  
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/organizations/end-users',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ODY0OWEwNzM3ZDA4NjYxZDM3NDcyMiIsImVtYWlsIjoiZ2FzZWlrQGdtYWlsLmNvbSIsInJvbGUiOiJtYW51ZmFjdHVyZXIiLCJpYXQiOjE3NTQwMDIzNDUsImV4cCI6MTc1NDYwNzE0NX0.H38pleWPItL8o1Fwnonqgnmim1F7HQEjAiNagxUn1xg'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ API working correctly');
      } else if (res.statusCode === 500) {
        console.log('❌ 500 Server Error');
        console.log('Check server logs for details');
      } else {
        console.log(`❌ Unexpected status: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Request error:', error.message);
  });

  req.end();
}

testMinimalApi(); 