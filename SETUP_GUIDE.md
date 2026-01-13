# Complete Setup Guide - What's Needed to Start

## Current Status

✅ **Running:**
- Admin App (Port 3000)
- Organizer App (Port 3001)
- Attendee App (Port 3002)

❌ **Missing/Not Running:**
1. Backend Server (Port 4000) - **CRITICAL**
2. MySQL Database - **REQUIRED**
3. Backend `.env` file - **CREATED** ✅

---

## Step-by-Step Setup

### 1. Install and Start MySQL (If Not Installed)

**Option A: If MySQL is NOT installed:**
- Download MySQL from: https://dev.mysql.com/downloads/installer/
- Install MySQL Server
- During installation, set a root password (remember it!)

**Option B: If MySQL is installed but not running:**
```powershell
# Check MySQL status
Get-Service -Name MySQL* | Select-Object Name, Status

# If stopped, start it (requires admin privileges)
Start-Service -Name MySQL80  # Adjust name if different
```

**Option C: Using XAMPP/WAMP (Easier for Windows):**
- Download XAMPP: https://www.apachefriends.org/
- Install and start MySQL from XAMPP Control Panel
- Default port: 3306

### 2. Create Database

Open MySQL command line or MySQL Workbench and run:
```sql
CREATE DATABASE event_registration;
```

Or using command line:
```powershell
mysql -u root -p
# Enter password when prompted
CREATE DATABASE event_registration;
EXIT;
```

### 3. Configure Backend .env File

**Location:** `backend/.env`

**Already created!** But you need to update it with your MySQL password:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE  # ← Change this!
DB_DATABASE=event_registration
JWT_SECRET=event-registration-secret-key-change-in-production-2024
```

**Important:** Replace `YOUR_MYSQL_PASSWORD_HERE` with your actual MySQL root password.

### 4. Start Backend Server

Open a NEW terminal window and run:
```powershell
cd C:\Users\Admin\laboratory-activities\Activity10\backend
npm run start:dev
```

**What to expect:**
- It will compile TypeScript
- Connect to MySQL database
- Create tables automatically (TypeORM synchronize)
- Start on port 4000
- You should see:
  ```
  🚀 Server is running on http://localhost:4000
  📚 Swagger API Documentation: http://localhost:4000/api
  ```

### 5. Verify Everything is Running

**Check all ports:**
```powershell
Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -in 3000,3001,3002,4000,3306 } | Select-Object LocalPort, State | Format-Table
```

**Should show:**
- Port 3000 ✅ (Admin App)
- Port 3001 ✅ (Organizer App)
- Port 3002 ✅ (Attendee App)
- Port 4000 ✅ (Backend) - **MUST BE RUNNING**
- Port 3306 ✅ (MySQL) - **MUST BE RUNNING**

---

## Quick Fix Commands

### If Backend Fails to Start:

**Error: "Cannot connect to database"**
- Check MySQL is running
- Verify `.env` file has correct password
- Check database exists: `SHOW DATABASES;`

**Error: "Port 4000 already in use"**
```powershell
# Find what's using port 4000
Get-NetTCPConnection -LocalPort 4000 | Select-Object OwningProcess
# Kill the process or use a different port
```

**Error: "ECONNREFUSED"**
- MySQL is not running or wrong credentials
- Check MySQL service status

---

## Complete Startup Checklist

- [ ] MySQL installed and running (Port 3306)
- [ ] Database `event_registration` created
- [ ] Backend `.env` file configured with correct password
- [ ] Backend server running (Port 4000) ← **DO THIS NOW**
- [ ] Admin App running (Port 3000) ✅
- [ ] Organizer App running (Port 3001) ✅
- [ ] Attendee App running (Port 3002) ✅

---

## After Everything is Running

1. **Test Backend:** 
   - Visit: http://localhost:4000/api (Swagger UI)
   - Should see API documentation

2. **Create Admin User:**
   - Go to Swagger: http://localhost:4000/api
   - Use `POST /auth/register` endpoint
   - Body:
     ```json
     {
       "email": "admin@example.com",
       "password": "admin123",
       "fullName": "Admin User",
       "role": "admin"
     }
     ```

3. **Test Frontend:**
   - Admin App: http://localhost:3000
   - Login with admin credentials
   - Should work now!

---

## Most Common Issue

**"Frontend apps load but can't login/register"**
→ **Backend is NOT running!** 

**Solution:**
```powershell
cd backend
npm run start:dev
```

Wait for the "Server is running" message before testing frontend apps.
