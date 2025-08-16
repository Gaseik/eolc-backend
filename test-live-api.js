async function testLiveApi() {
  try {
    console.log('Testing live API...');
    
    // 測試 URL
    const url = 'http://localhost:8080/models/68880f43d6999e323f7aa18c';
    
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include', // 包含 cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success!');
      console.log(`Data:`, data);
    } else {
      const errorData = await response.json();
      console.log('❌ Error:');
      console.log(`Status: ${response.status}`);
      console.log(`Error:`, errorData);
    }
    
  } catch (error) {
    console.log('❌ Network Error:');
    console.log(`Error: ${error.message}`);
  }
}

testLiveApi(); 