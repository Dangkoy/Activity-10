# Check Which User Account You're Using

## Step 1: Find Your User Account

In the phpMyAdmin screenshot, I can see you have these organizer accounts:
- `JohnDoe@gmail.com` - role: `organizer`
- `Danna@gmail.com` - role: `organizer`

**Which email did you use to register/log in?** 

## Step 2: Check the FULL User Record

1. In phpMyAdmin, find your user row
2. Click the **"Edit"** button (pencil icon) for your user
3. This will show ALL columns including:
   - `role` (should be `organizer`)
   - `isActive` (should be `1` or checked)
   - All other fields

**If `isActive` is `0` or unchecked:**
- Change it to `1` or check the box
- Click "Go" to save

## Step 3: Verify in Browser

1. Open your browser's Developer Tools (F12)
2. Go to **Console** tab
3. Type this and press Enter:
   ```javascript
   JSON.parse(localStorage.getItem('user'))
   ```
4. This will show which user account you're currently logged in with
5. Check:
   - `email` - which account is it?
   - `role` - what role does it show?

## Step 4: If Your User Has Wrong Role

If your user shows `role: 'attendee'` in the database:

1. Click **Edit** on your user row
2. Find the `role` dropdown/field
3. Change it to `organizer`
4. Make sure `isActive` is `1` or checked
5. Click **Go** to save

## Step 5: After Fixing

1. **Log out** of the organizer app
2. **Clear browser storage** (F12 → Application → Local Storage → Clear)
3. **Close browser completely**
4. **Reopen** and log in again
5. Try creating an event
