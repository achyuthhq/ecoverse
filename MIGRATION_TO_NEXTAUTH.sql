-- SQL Commands to Prepare Database for NextAuth
-- Run these in your database SQL editor if needed

-- 1. Ensure email field is properly set up (already exists, just verify)
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL; -- Optional: Make email required
-- Note: NextAuth works with nullable email, so current setup is fine

-- 2. Ensure password field exists (already exists)
-- No changes needed

-- 3. Ensure emailVerified field exists (already exists)
-- No changes needed

-- 4. Optional: Remove AccessCode relation if you want to clean up
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_accessCodeId_fkey";
ALTER TABLE "User" DROP COLUMN IF EXISTS "accessCodeId";

-- 5. Optional: Clean up AccessCode table if not needed
DROP TABLE IF EXISTS "AccessCode";

-- Note: Your current schema is already compatible with NextAuth!
-- The User model has all required fields: email, password, emailVerified
-- Account and Session models are already set up correctly

-- If you want to keep AccessCode for future use, just leave it as is.
-- The main authentication will use NextAuth with email/password and Google OAuth.


