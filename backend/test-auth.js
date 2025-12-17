const axios = require('axios');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzY0MDQ4NDQ3LCJleHAiOjE3NjQxMzQ4NDd9.qwqI3DNqioupiSKoki4q2DMAj0A8ZyNX3VoDzN1PmFA';
const baseURL = 'http://localhost:3000/api';

async function testAuth() {
    try {
        console.log('Testing authentication with token...\n');
        console.log('Token:', token.substring(0, 30) + '...\n');

        // Try a simple authenticated endpoint first
        const response = await axios.get(`${baseURL}/roadmap/latest`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Authentication successful!');
        console.log('Response:', response.data);

    } catch (error) {
        console.error('❌ Authentication failed');
        console.error('Status:', error.response?.status);
        console.error('Error:', error.response?.data);
        console.error('\nFull error message:', error.message);

        if (error.response?.status === 401) {
            console.log('\n💡 Token validation failed. This could mean:');
            console.log('   1. Token was not generated with current JWT_SECRET');
            console.log('   2. Token is expired');
            console.log('   3. Backend was restarted with different .env settings');
            console.log('\nTry generating a NEW token by running: node get-token.js');
        }
    }
}

testAuth();
