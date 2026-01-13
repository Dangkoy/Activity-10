# Database Setup Using phpMyAdmin

## Step 1: Create the Database

1. **Click "New" or "Databases" tab** in phpMyAdmin
2. **Database name:** Type `event_registration`
3. **Collation:** Select `utf8mb4_unicode_ci` (or leave default)
4. **Click "Create"** button

## Step 2: Verify Database Created

You should see `event_registration` appear in the left sidebar database list.

## Step 3: Update Backend .env File

The backend needs to connect to this database. Update `backend/.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=          # Leave empty if no password set
DB_DATABASE=event_registration
JWT_SECRET=event-registration-secret-key-change-in-production-2024
```

**Important Notes:**
- If MySQL root has NO password: Leave `DB_PASSWORD=` empty
- If MySQL root has a password: Enter it in `DB_PASSWORD=yourpassword`
- Default MariaDB/XAMPP usually has NO password for root

## Step 4: Test Connection

After starting the backend, it will automatically create all tables in the `event_registration` database.
