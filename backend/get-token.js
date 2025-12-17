const axios = require('axios');

const baseURL = 'http://localhost:3000/api';

async function login() {
    try {
        console.log('🔐 Logging in...\n');

        const response = await axios.post(`${baseURL}/auth/login`, {
            email: 'augustenrabi2020@gmail.com',
            password: 'password123'
        });

        console.log('✅ Login successful!');
        console.log('\n📋 Your JWT Token:');
        console.log(response.data.token);
        console.log('\n👤 User Info:');
        console.log(`Name: ${response.data.user.name}`);
        console.log(`Email: ${response.data.user.email}`);
        console.log(`ID: ${response.data.user.id}`);

        console.log('\n💡 Copy the token above and update line 3 in test-core-features.js');

        return response.data.token;
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('❌ Login failed. Account may not exist or wrong credentials.');
            console.log('\n📝 Let\'s try registering a new account...\n');
            return await register();
        } else {
            console.error('\n❌ Error during login:', error.message);
        }
    }
}

async function register() {
    try {
        console.log('📝 Registering new account...\n');

        const response = await axios.post(`${baseURL}/auth/register`, {
            name: 'Augusten Rabi MP',
            email: 'augustenrabi2020@gmail.com',
            password: 'password123'
        });

        console.log('✅ Registration successful!');
        console.log('\n📋 Your JWT Token:');
        console.log(response.data.token);
        console.log('\n👤 User Info:');
        console.log(`Name: ${response.data.user.name}`);
        console.log(`Email: ${response.data.user.email}`);
        console.log(`ID: ${response.data.user.id}`);

        console.log('\n💡 Copy the token above and update line 3 in test-core-features.js');
        console.log('   Then run: node test-core-features.js');

        return response.data.token;
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('❌ User already exists. Try logging in with different credentials.');
        } else {
            console.error('\n❌ Error during registration:', error.response?.data || error.message);
        }
    }
}

// Run login
login();
