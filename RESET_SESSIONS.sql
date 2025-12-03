-- SQL Commands to Reset Session Data
-- This will log out all users by clearing their sessions
-- Run these commands in your PostgreSQL database

-- 1. Clear all active sessions (logs everyone out)
DELETE FROM "Session";

-- 2. Clear expired sessions (optional - just cleanup)
DELETE FROM "Session" WHERE "expires" < NOW();

-- 3. Clear OAuth account tokens (optional - resets OAuth connections)
-- This will require users to re-authenticate with Google/OAuth providers
UPDATE "Account" SET 
  "refresh_token" = NULL,
  "access_token" = NULL,
  "expires_at" = NULL,
  "id_token" = NULL,
  "session_state" = NULL;

-- 4. Clear verification tokens (optional - clears pending email verifications)
DELETE FROM "VerificationToken" WHERE "expires" < NOW();

-- 5. Optional: Reset all verification tokens (including active ones)
-- DELETE FROM "VerificationToken";

-- ============================================
-- QUICK RESET (Most Common Use Case)
-- ============================================
-- If you just want to log everyone out immediately, run this:
-- DELETE FROM "Session";

-- ============================================
-- SELECTIVE RESET (For Specific User)
-- ============================================
-- To log out a specific user by email:
-- DELETE FROM "Session" 
-- WHERE "userId" IN (
--   SELECT "id" FROM "User" WHERE "email" = 'user@example.com'
-- );

-- ============================================
-- CHECK CURRENT SESSIONS (Before Resetting)
-- ============================================
-- To see all active sessions before clearing:
-- SELECT s.*, u.email, u.name 
-- FROM "Session" s
-- JOIN "User" u ON s."userId" = u.id
-- WHERE s."expires" > NOW()
-- ORDER BY s."expires" DESC;

