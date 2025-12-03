-- SQL Commands to Clean Up Code-Based Authentication System
-- Run these in your database SQL editor to remove old code-based auth data

-- 1. Remove AccessCode foreign key constraint from User table
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_accessCodeId_fkey";

-- 2. Remove accessCodeId column from User table (if it exists)
ALTER TABLE "User" DROP COLUMN IF EXISTS "accessCodeId";

-- 3. Delete all AccessCode records
DELETE FROM "AccessCode";

-- 4. Drop the AccessCode table completely
DROP TABLE IF EXISTS "AccessCode";

-- 5. Optional: Clean up Admin table if you don't need it
-- DELETE FROM "Admin";
-- DROP TABLE IF EXISTS "Admin";

-- 6. Optional: Remove subscription-related fields if not needed
-- ALTER TABLE "User" DROP COLUMN IF EXISTS "subscriptionType";
-- ALTER TABLE "User" DROP COLUMN IF EXISTS "subscriptionExpires";

-- 7. Optional: Clean up any users that were created with code-based auth (users without email)
-- DELETE FROM "User" WHERE "email" IS NULL AND "password" IS NULL;

-- Note: Keep the Admin table if you still want to use the admin dashboard
-- The Admin table is separate from the code-based auth system



