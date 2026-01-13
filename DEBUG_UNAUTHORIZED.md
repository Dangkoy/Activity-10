# Debug "Unauthorized" Error - Step by Step

## IMPORTANT: You MUST do these steps in order!

### Step 1: Verify Database is Fixed ✅

1. Open phpMyAdmin: http://localhost/phpMyAdmin
2. Select database: `event_registration` (or your database name)
3. Click on `users` table
4. Find your user by email
5. **VERIFY these values:**
   - `role` column = **`'organizer'`** (exactly this, case-sensitive)
   - `isActive` column = **`1`** (or checked/true)

**If either is wrong, fix it with SQL:**
```sql
UPDATE users 
SET role = 'organizer', isActive = 1 
WHERE email = 'YOUR_EMAIL_HERE';
```

### Step 2: Restart Backend Server ✅

1. **STOP the backend** (press Ctrl+C in the backend terminal)
2. **START it again:**
   ```powershell
   cd backend
   npm run start:dev
   ```
3. **Wait for it to fully start** (you'll see "Nest application successfully started")

### Step 3: Clear Browser Storage ✅

**In Chrome/Edge:**
1. Press **F12** (Developer Tools)
2. Go to **Application** tab
3. Left sidebar: **Local Storage** → `http://localhost:3001`
4. **Right-click** → **Clear** (or delete `token` and `user` manually)
5. Also check **Session Storage** → `http://localhost:3001` → **Clear**

**Alternative - Clear Everything:**
- Press **Ctrl+Shift+Delete**
- Select "Cookies and site data" and "Cached images and files"
- Time range: "Last hour" or "All time"
- Click "Clear data"

### Step 4: Close Browser Completely ✅

1. **Close ALL Chrome/Edge windows**
2. Wait 2-3 seconds
3. **Reopen** the browser
4. Go to: http://localhost:3001

### Step 5: Log In Again ✅

1. Go to: http://localhost:3001/login
2. **Log in** with your organizer account
3. You should be redirected to the dashboard

### Step 6: Try Creating Event ✅

1. Go to: http://localhost:3001/events/new
2. Fill in the event form
3. Click "Create Event"

### Step 7: Check Backend Console Logs ✅

**When you click "Create Event", check the backend terminal. You should see:**

```
JWT Strategy: Validating user with ID: <your-user-id>
JWT Strategy: User validated successfully: { id: '...', email: '...', role: 'organizer', isActive: true }
RolesGuard: Checking role access { userRole: 'organizer', ... }
RolesGuard: Comparing 'organizer' with 'organizer' (organizer): true
RolesGuard: Access granted for user: <your-email> with role: organizer
EventsController: Creating event { userId: '...', userEmail: '...', userRole: 'organizer', ... }
```

**If you see:**
- `role: 'attendee'` → Database still has wrong role
- `Access denied` → Role comparison is failing
- `User not found` → User ID doesn't exist in database
- `User is inactive` → isActive = 0 in database

### Step 8: Still Not Working?

**Copy the backend console logs** when you try to create an event and share them. The logs will show exactly what's wrong.
