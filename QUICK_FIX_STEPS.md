# Quick Fix Steps - "Invalid Token" Error

## The Problem
The error "Invalid token. Please log in again." means your current token was signed with a different secret or is corrupted.

## Solution (3 Steps)

### Step 1: Restart Backend
```powershell
cd backend
npm run start:dev
```
Wait for: "Nest application successfully started"

### Step 2: Clear Browser Storage
1. Press **F12** → **Application** tab
2. **Local Storage** → `http://localhost:3001` → **Clear**
3. **Session Storage** → `http://localhost:3001` → **Clear**
4. **Close browser completely** (all windows)
5. **Wait 3 seconds**
6. **Reopen browser**

### Step 3: Log In Again
1. Go to: http://localhost:3001/login
2. Log in with: `danna@gmail.com` (and your password)
3. Try creating an event

## Why This Works
- The token in your browser was created before the backend fixes
- Clearing storage removes the old token
- Logging in again creates a new token with the correct secret
- The new token will work with the fixed backend

## If Still Not Working
Check backend console logs when you try to create an event. You should see:
```
JwtStrategy initialized with secret: SECRET_SET
JwtAuthGuard: Authentication successful for user: danna@gmail.com
JWT Strategy: Validating user with ID: ...
```

If you see errors, share the backend console output.
