# Fix "Unauthorized" Error for Organizer

## Quick Diagnosis Steps

### Step 1: Check Backend Console Logs
When you try to create an event, check the backend console (where `npm run start:dev` is running) for these logs:
- `JWT Strategy: Validating user with ID: ...`
- `JWT Strategy: User validated successfully: { role: ... }`
- `RolesGuard: Checking role access`
- `RolesGuard: Access denied` or `RolesGuard: Access granted`

**Look for what role the backend sees for your user.**

### Step 2: Check Your User in the Database

1. Open phpMyAdmin (http://localhost/phpMyAdmin)
2. Select the `event_registration` database (or your database name)
3. Click on the `users` table
4. Find your user account (by email)
5. Check these columns:
   - `role` - Should be `'organizer'` (NOT `'attendee'`)
   - `isActive` - Should be `1` (true)

### Step 3: Fix Your User Role (if needed)

If your `role` is `'attendee'` instead of `'organizer'`, run this SQL query:

```sql
UPDATE users 
SET role = 'organizer', isActive = 1 
WHERE email = 'YOUR_EMAIL_HERE';
```

Replace `YOUR_EMAIL_HERE` with your actual email address.

### Step 4: Clear Browser Storage and Re-login

After fixing the database:

1. Open your browser's Developer Tools (F12)
2. Go to the "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Click "Local Storage" → `http://localhost:3001`
4. Delete the `token` and `user` entries
5. Close and reopen the browser (or clear all cookies for localhost)
6. Log in again with your organizer account

### Step 5: Verify Everything Works

1. Make sure your backend is running: `cd backend && npm run start:dev`
2. Make sure your organizer app is running: `cd frontend/organizer-app && npm run dev`
3. Log in again
4. Try creating an event

## Why This Happens

The registration form sends `role: 'organizer'` to the backend, but if the backend validation fails or the database has a default value, your role might be saved as `'attendee'` instead.

## Still Not Working?

Check the backend console logs when you:
1. Register a new account
2. Log in
3. Try to create an event

The logs will show exactly what's happening at each step.
