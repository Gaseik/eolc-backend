const http = require('http');

async function debugApiError() {
  try {
    console.log('=== Debugging GET /organizations/end-users API Error ===');
    
    // 測試未認證的請求
    console.log('\n1. Testing unauthenticated request...');
    
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/organizations/end-users',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
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
        
        if (res.statusCode === 500) {
          console.log('❌ 500 Internal Server Error detected');
          console.log('This indicates a server-side error in the API');
        } else if (res.statusCode === 401) {
          console.log('✅ Correctly rejected request (401)');
        } else {
          console.log(`❌ Unexpected status code: ${res.statusCode}`);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request error:', error.message);
    });

    req.end();

    // 等待 3 秒讓請求完成
    setTimeout(() => {
      console.log('\n=== Debug Summary ===');
      console.log('If you see 500 error, check:');
      console.log('1. Server logs for detailed error message');
      console.log('2. Database connection');
      console.log('3. Model imports in organizationController.ts');
      console.log('4. JWT middleware configuration');
      
      console.log('\n=== Next Steps ===');
      console.log('1. Check server console for error logs');
      console.log('2. Verify database connection');
      console.log('3. Test with valid JWT token');
      
      process.exit(0);
    }, 3000);
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    process.exit(1);
  }
}

debugApiError(); 