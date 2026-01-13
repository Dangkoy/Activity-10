# Startup Checklist

## ✅ Currently Running
- [x] Admin App (Port 3000) - http://localhost:3000
- [x] Organizer App (Port 3001) - http://localhost:3001
- [x] Attendee App (Port 3002) - http://localhost:3002

## ❌ NEEDS TO BE STARTED

### 1. Backend Server (CRITICAL - Port 4000)
**Status:** Not running ⚠️
**Command:**
```powershell
cd C:\Users\Admin\laboratory-activities\Activity10\backend
npm run start:dev
```

**Why it's needed:**
- All frontend apps make API calls to the backend
- Without backend, login won't work
- No data can be saved or retrieved
- Swagger API docs won't be accessible

### 2. MySQL Database (REQUIRED)
**Check if running:**
```powershell
# Check if MySQL service is running
Get-Service -Name MySQL* | Select-Object Name, Status
```

**If not running:**
```powershell
# Start MySQL service (may require admin)
Start-Service -Name MySQL80  # or MySQL57, depending on version
```

**Database Setup:**
1. Create the database:
```sql
CREATE DATABASE event_registration;
```

2. Verify `.env` file exists in `backend` directory with:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=event_registration
JWT_SECRET=your-secret-key-change-in-production
```

## 🔍 How to Verify Everything is Running

### Check Backend (Port 4000):
```powershell
Test-NetConnection -ComputerName localhost -Port 4000
```

### Check MySQL (Port 3306):
```powershell
Test-NetConnection -ComputerName localhost -Port 3306
```

### Quick Status Check:
```powershell
Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -in 3000,3001,3002,4000,3306 } | Select-Object LocalPort, State | Format-Table
```

## 📝 Complete Startup Sequence

1. **Start MySQL Database** (if not running)
2. **Verify database exists** (`event_registration`)
3. **Check backend `.env` file** has correct credentials
4. **Start Backend Server:**
   ```powershell
   cd backend
   npm run start:dev
   ```
5. **Verify Backend is accessible:**
   - API: http://localhost:4000
   - Swagger: http://localhost:4000/api

## 🎯 What Happens When Backend Starts

Once backend starts, you should see:
```
🚀 Server is running on http://localhost:4000
📚 Swagger API Documentation: http://localhost:4000/api
```

Then your frontend apps will be able to:
- ✅ Login/Register users
- ✅ Create/View events
- ✅ Register for events
- ✅ Generate QR codes
- ✅ All API operations
