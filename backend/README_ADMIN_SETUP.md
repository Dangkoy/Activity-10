# Admin Account Setup Guide

## How to Create an Admin Account

There are two ways to create an admin account for login:

### Method 1: Using the Registration API (Easiest)

You can register an admin account directly using the `/auth/register` endpoint. Use any API client (Postman, curl, or the Swagger UI):

**Using Swagger UI (Recommended):**
1. Start the backend server: `npm run start:dev`
2. Open http://localhost:4000/api in your browser
3. Navigate to the `auth` section
4. Click on `POST /auth/register`
5. Click "Try it out"
6. Enter the following JSON:
```json
{
  "email": "admin@example.com",
  "password": "admin123",
  "fullName": "System Administrator",
  "role": "admin"
}
```
7. Click "Execute"
8. You'll receive a token - you can now login with these credentials

**Using curl:**
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "fullName": "System Administrator",
    "role": "admin"
  }'
```

### Method 2: Using the Seed Script

1. Make sure the backend server is running
2. Run the seed script:
```bash
cd backend
npx ts-node src/scripts/seed-admin.ts
```

Or if you have ts-node installed globally:
```bash
ts-node src/scripts/seed-admin.ts
```

The default admin credentials will be:
- **Email:** admin@example.com
- **Password:** admin123

You can customize these by setting environment variables:
```bash
ADMIN_EMAIL=your-email@example.com ADMIN_PASSWORD=your-password ADMIN_NAME="Your Name" ts-node src/scripts/seed-admin.ts
```

### Method 3: Direct Database Insert (Alternative)

If you have direct database access (phpMyAdmin or MySQL client):

1. Connect to your MySQL database (`event_registration`)
2. Run this SQL query (you'll need to hash the password first using bcrypt):

```sql
INSERT INTO users (id, email, password, fullName, role, isActive, createdAt, updatedAt)
VALUES (
  UUID(),
  'admin@example.com',
  '$2b$10$YourHashedPasswordHere',  -- Use bcrypt to hash 'admin123'
  'System Administrator',
  'admin',
  1,
  NOW(),
  NOW()
);
```

**Note:** You'll need to generate a bcrypt hash for the password. You can use an online bcrypt generator or Node.js:
```javascript
const bcrypt = require('bcrypt');
const hash = bcrypt.hashSync('admin123', 10);
console.log(hash);
```

## Login to Admin App

Once you have created an admin account:

1. Start the admin frontend app:
   ```bash
   cd frontend/admin-app
   npm start
   ```
   (or `npm run dev` if using Vite)

2. Open http://localhost:3000/login in your browser

3. Use the admin credentials you created:
   - **Email:** admin@example.com (or the email you used)
   - **Password:** admin123 (or the password you set)

4. After successful login, you'll be redirected to the admin dashboard

## Default Admin Credentials

If you used the seed script with defaults:
- **Email:** admin@example.com
- **Password:** admin123

⚠️ **Important:** Change the default password after first login in a production environment!
