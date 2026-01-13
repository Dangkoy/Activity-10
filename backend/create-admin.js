// Simple script to create admin account using the API
// Run this with: node create-admin.js

const http = require('http');

const adminData = {
  email: 'admin@example.com',
  password: 'admin123',
  fullName: 'System Administrator',
  role: 'admin'
};

const postData = JSON.stringify(adminData);

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 201 || res.statusCode === 200) {
      console.log('\n✅ Admin account created successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:    ' + adminData.email);
      console.log('🔑 Password: ' + adminData.password);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('Response:', JSON.parse(data));
      console.log('\nYou can now login at http://localhost:3000/login\n');
    } else if (res.statusCode === 409) {
      console.log('\n✅ Admin account already exists!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:    ' + adminData.email);
      console.log('🔑 Password: ' + adminData.password);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('You can use these credentials to login.\n');
    } else {
      console.error('\n❌ Failed to create admin account');
      console.error('Status Code:', res.statusCode);
      console.error('Response:', data);
      console.error('\nMake sure the backend is running on http://localhost:4000\n');
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Error creating admin account:');
  console.error(error.message);
  console.error('\nMake sure the backend is running:');
  console.error('  cd backend');
  console.error('  npm run start:dev\n');
});

req.write(postData);
req.end();
