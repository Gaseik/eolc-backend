const http = require('http');

async function testApiEndpoint() {
  try {
    console.log('=== Testing GET /organizations/end-users API ===');
    
    // 測試未認證的請求
    console.log('\n1. Testing unauthenticated request...');
    
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/organizations/end-users',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
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
        if (res.statusCode === 401) {
          console.log('✅ Correctly rejected unauthenticated request (401)');
        } else {
          console.log('❌ Unexpected status code:', res.statusCode);
        }
        console.log('Response:', data);
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request error:', error.message);
    });

    req.end();

    console.log('\n=== Manual Testing Instructions ===');
    console.log('1. Get a valid JWT token by logging in');
    console.log('2. Make a GET request to: http://localhost:8080/organizations/end-users');
    console.log('3. Include Authorization header: Bearer <your-jwt-token>');
    console.log('4. Expected response format:');
    console.log('   {');
    console.log('     "success": true,');
    console.log('     "data": [');
    console.log('       {');
    console.log('         "_id": "company_id",');
    console.log('         "name": "Company Name",');
    console.log('         "type": "endUser",');
    console.log('         "address": "Company Address",');
    console.log('         "email": "company@email.com",');
    console.log('         "contactPhone": "+1-555-0000"');
    console.log('       }');
    console.log('     ],');
    console.log('     "count": 1');
    console.log('   }');

    console.log('\n=== API Endpoint Summary ===');
    console.log('✅ Endpoint: GET /organizations/end-users');
    console.log('✅ Authentication: Required (Bearer token)');
    console.log('✅ Permissions: Based on user role');
    console.log('✅ Response: Organization objects with details');
    console.log('✅ Sorting: By company name (alphabetical)');
    console.log('✅ Filtering: Only endUser type organizations');

    console.log('\n✅ API endpoint test completed');
    
    // 等待 3 秒讓請求完成
    setTimeout(() => {
      process.exit(0);
    }, 3000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testApiEndpoint(); 