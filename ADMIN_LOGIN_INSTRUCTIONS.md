# How to Login as Admin

## Quick Setup (Easiest Method)

### Option 1: Create Admin Account via Swagger API (Recommended)

1. **Make sure the backend is running:**
   ```bash
   cd backend
   npm run start:dev
   ```
   Backend should be running on http://localhost:4000

2. **Open Swagger UI in your browser:**
   - Go to: http://localhost:4000/api
   - You'll see the API documentation interface

3. **Create Admin Account:**
   - Find the `auth` section
   - Click on `POST /auth/register`
   - Click "Try it out"
   - Enter this JSON payload:
   ```json
   {
     "email": "admin@example.com",
     "password": "admin123",
     "fullName": "System Administrator",
     "role": "admin"
   }
   ```
   - Click "Execute"
   - You should see a success response with an `accessToken`

4. **Login to Admin App:**
   - Start the admin frontend:
     ```bash
     cd frontend/admin-app
     npm start
     ```
   - Open http://localhost:3000/login
   - Use these credentials:
     - **Email:** admin@example.com
     - **Password:** admin123

### Option 2: Create Admin Account via curl

Open a terminal and run:

```bash
curl -X POST http://localhost:4000/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"admin123\",\"fullName\":\"System Administrator\",\"role\":\"admin\"}"
```

(Note: Use `^` for Windows PowerShell, or use `\` for Linux/Mac)

### Option 3: Using the Seed Script

1. Make sure backend is running
2. In a new terminal, run:
   ```bash
   cd backend
   npm run seed:admin
   ```

   This will create an admin account with:
   - Email: admin@example.com
   - Password: admin123

## Default Admin Credentials

After creating the admin account using any method above:

- **Email:** admin@example.com
- **Password:** admin123

⚠️ **Important:** Change this password after first login in production!

## Troubleshooting

**If you get "Email already registered":**
- The admin account already exists
- Use the credentials you set (or default: admin@example.com / admin123)

**If backend is not running:**
- Start it first: `cd backend && npm run start:dev`
- Wait for the message: "Server is running on http://localhost:4000"

**If you can't access Swagger:**
- Make sure backend is running on port 4000
- Check http://localhost:4000/api
- If that doesn't work, use curl or Postman to call the API directly

## Admin App Access

Once logged in, you'll have access to:
- Dashboard - Overview of system statistics
- Events - View, edit, and delete all events
- Organizers - Manage organizer accounts
- Reports - Export data and view statistics
