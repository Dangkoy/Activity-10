# How to Start the Applications

## ❌ WRONG - Don't run from `frontend` directory
```bash
cd frontend
npm start  # ❌ This won't work! No package.json here
```

## ✅ CORRECT - Run from specific app directories

### Option 1: Admin App (Port 3000)
```bash
cd frontend/admin-app
npm start
# or
npm run dev
```

### Option 2: Organizer App (Port 3001)
```bash
cd frontend/organizer-app
npm start
# or
npm run dev
```

### Option 3: Attendee App (Port 3002)
```bash
cd frontend/attendee-app
npm start
# or
npm run dev
```

### Backend (Port 4000)
```bash
cd backend
npm run start:dev  # Use this for development
# or
npm run build
npm start  # After building
```

## Quick Start Commands

Open separate terminal windows/tabs for each:

**Terminal 1 - Backend:**
```powershell
cd C:\Users\Admin\laboratory-activities\Activity10\backend
npm run start:dev
```

**Terminal 2 - Admin App:**
```powershell
cd C:\Users\Admin\laboratory-activities\Activity10\frontend\admin-app
npm start
```

**Terminal 3 - Organizer App:**
```powershell
cd C:\Users\Admin\laboratory-activities\Activity10\frontend\organizer-app
npm start
```

**Terminal 4 - Attendee App:**
```powershell
cd C:\Users\Admin\laboratory-activities\Activity10\frontend\attendee-app
npm start
```
