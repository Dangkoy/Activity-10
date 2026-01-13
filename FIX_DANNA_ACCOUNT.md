# Fix danna@gmail.com Account

## Step 1: Check isActive Column in phpMyAdmin

1. In phpMyAdmin, find the row with email `danna@gmail.com`
2. Click the **Edit** button (pencil icon) for that row
3. Look for the `isActive` column/field
4. **Make sure it's set to `1`** (or checked/enabled)
   - If it shows `0` or is unchecked, change it to `1` or check it
5. **Also verify `role` is `organizer`** (should already be correct)
6. Click **Go** to save

## Step 2: Restart Backend (IMPORTANT!)

1. Find your backend terminal (where `npm run start:dev` is running)
2. Press **Ctrl+C** to stop it
3. Start it again:
   ```powershell
   cd backend
   npm run start:dev
   ```
4. Wait until you see: `Nest application successfully started`

## Step 3: Clear Browser and Log Out

1. In the organizer app (http://localhost:3001), click **Logout**
2. Press **F12** (Developer Tools)
3. Go to **Application** tab
4. **Local Storage** → `http://localhost:3001` → **Right-click** → **Clear**
5. **Session Storage** → `http://localhost:3001` → **Right-click** → **Clear**
6. Close browser completely (all windows)
7. Wait 2-3 seconds
8. Reopen browser

## Step 4: Log In Again

1. Go to: http://localhost:3001/login
2. Log in with: `danna@gmail.com`
3. Use your password
4. After logging in, you should see the dashboard

## Step 5: Try Creating Event + Check Backend Logs

1. Go to: http://localhost:3001/events/new
2. Fill in the event form
3. Click **Create Event**
4. **IMMEDIATELY** check your backend terminal

You should see logs like:
```
AuthService: Login attempt for email: danna@gmail.com
AuthService: Login successful: { id: '...', email: 'danna@gmail.com', role: 'organizer', isActive: true }
...
JWT Strategy: Validating user with ID: ...
JWT Strategy: User validated successfully: { id: '...', email: 'danna@gmail.com', role: 'organizer', isActive: true }
RolesGuard: Checking role access { userRole: 'organizer', ... }
RolesGuard: Comparing 'organizer' with 'organizer' (organizer): true
RolesGuard: Access granted for user: danna@gmail.com with role: organizer
EventsController: Creating event { userId: '...', userEmail: 'danna@gmail.com', userRole: 'organizer', ... }
```

**If you see `role: 'attendee'` or `isActive: false` in the logs**, then the database still needs fixing.

**If you see `Access denied`**, copy the full error message and share it with me.
