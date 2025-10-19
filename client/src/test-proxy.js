// Test script to verify the proxy is working
// This can be run in the browser console

console.log("Testing API proxy...");

// Test a simple API endpoint
fetch('/api/emergency/medical-id')
  .then(response => {
    console.log('Proxy test response status:', response.status);
    if (response.status === 401) {
      console.log('✅ Proxy is working! API request reached backend but requires authentication.');
    } else {
      console.log('Proxy test response:', response);
    }
  })
  .catch(error => {
    console.error('❌ Proxy test failed:', error);
  });