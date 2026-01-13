-- Fix danna@gmail.com user account
-- Run this in phpMyAdmin SQL tab

UPDATE users 
SET 
    role = 'organizer',
    isActive = 1
WHERE email = 'danna@gmail.com';

-- Verify the fix
SELECT id, email, fullName, role, isActive 
FROM users 
WHERE email = 'danna@gmail.com';
