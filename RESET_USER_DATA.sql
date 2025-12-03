-- SQL Commands to Reset All User Data (Keep Table Structures)
-- This will delete all user data but keep all tables and their structures
-- Run these commands in your PostgreSQL database

-- ============================================
-- IMPORTANT: This will delete ALL user data!
-- Tables will remain but all records will be cleared
-- ============================================

-- 1. Clear all sessions first (to avoid foreign key issues)
DELETE FROM "Session";

-- 2. Clear all OAuth accounts
DELETE FROM "Account";

-- 3. Clear all verification tokens
DELETE FROM "VerificationToken";

-- 4. Clear all analyses (user's analysis data)
DELETE FROM "Analysis";

-- 5. Clear all feedback
DELETE FROM "Feedback";

-- 6. Clear access code associations (set userId to NULL)
UPDATE "AccessCode" SET "userId" = NULL, "usedAt" = NULL;

-- 7. Finally, delete all users (this will cascade delete any remaining related data)
DELETE FROM "User";

-- ============================================
-- VERIFICATION QUERIES (Run after reset)
-- ============================================

-- Check if all users are deleted
-- SELECT COUNT(*) FROM "User";  -- Should return 0

-- Check if all sessions are cleared
-- SELECT COUNT(*) FROM "Session";  -- Should return 0

-- Check if all accounts are cleared
-- SELECT COUNT(*) FROM "Account";  -- Should return 0

-- Check if all analyses are cleared
-- SELECT COUNT(*) FROM "Analysis";  -- Should return 0

-- Check if all feedback is cleared
-- SELECT COUNT(*) FROM "Feedback";  -- Should return 0

-- Check users that would appear in leaderboard (users with analyses)
-- SELECT u.id, u.name, u.email, COUNT(a.id) as analysis_count
-- FROM "User" u
-- LEFT JOIN "Analysis" a ON u.id = a."userId"
-- GROUP BY u.id, u.name, u.email
-- HAVING COUNT(a.id) > 0
-- ORDER BY analysis_count DESC;

-- ============================================
-- FORCE DELETE ALL USERS (If cascade didn't work)
-- ============================================
-- If users are still showing up, run this to force delete:
-- 
-- -- Disable foreign key checks temporarily (PostgreSQL doesn't support this directly)
-- -- Instead, delete in the correct order:
-- DELETE FROM "Session";
-- DELETE FROM "Account";
-- DELETE FROM "Analysis";
-- DELETE FROM "Feedback";
-- UPDATE "AccessCode" SET "userId" = NULL;
-- DELETE FROM "User";
--
-- -- If there are any remaining users, force delete them:
-- DELETE FROM "User" WHERE id IN (
--   SELECT id FROM "User"
-- );

-- ============================================
-- ALTERNATIVE: Reset Everything in One Go
-- ============================================
-- If you want to reset everything including access codes:
-- 
-- DELETE FROM "Session";
-- DELETE FROM "Account";
-- DELETE FROM "VerificationToken";
-- DELETE FROM "Analysis";
-- DELETE FROM "Feedback";
-- DELETE FROM "AccessCode";
-- DELETE FROM "User";
-- DELETE FROM "Admin";  -- Optional: if you want to reset admin accounts too

-- ============================================
-- DELETE USERS WITH NO ANALYSES (0 Points)
-- ============================================
-- To remove users who have no analyses (won't show in leaderboard anyway):
-- 
-- DELETE FROM "Session" WHERE "userId" IN (
--   SELECT u.id FROM "User" u
--   LEFT JOIN "Analysis" a ON u.id = a."userId"
--   GROUP BY u.id
--   HAVING COUNT(a.id) = 0
-- );
-- 
-- DELETE FROM "Account" WHERE "userId" IN (
--   SELECT u.id FROM "User" u
--   LEFT JOIN "Analysis" a ON u.id = a."userId"
--   GROUP BY u.id
--   HAVING COUNT(a.id) = 0
-- );
-- 
-- UPDATE "AccessCode" SET "userId" = NULL WHERE "userId" IN (
--   SELECT u.id FROM "User" u
--   LEFT JOIN "Analysis" a ON u.id = a."userId"
--   GROUP BY u.id
--   HAVING COUNT(a.id) = 0
-- );
-- 
-- DELETE FROM "User" WHERE id IN (
--   SELECT u.id FROM "User" u
--   LEFT JOIN "Analysis" a ON u.id = a."userId"
--   GROUP BY u.id
--   HAVING COUNT(a.id) = 0
-- );

-- ============================================
-- SELECTIVE DELETION (Delete Specific User)
-- ============================================
-- To delete a specific user by email:
-- 
-- DELETE FROM "Session" WHERE "userId" IN (SELECT "id" FROM "User" WHERE "email" = 'user@example.com');
-- DELETE FROM "Account" WHERE "userId" IN (SELECT "id" FROM "User" WHERE "email" = 'user@example.com');
-- DELETE FROM "Analysis" WHERE "userId" IN (SELECT "id" FROM "User" WHERE "email" = 'user@example.com');
-- DELETE FROM "Feedback" WHERE "userId" IN (SELECT "id" FROM "User" WHERE "email" = 'user@example.com');
-- UPDATE "AccessCode" SET "userId" = NULL WHERE "userId" IN (SELECT "id" FROM "User" WHERE "email" = 'user@example.com');
-- DELETE FROM "User" WHERE "email" = 'user@example.com';

-- ============================================
-- RESET AUTO-INCREMENT SEQUENCES (Optional)
-- ============================================
-- If you want to reset any auto-incrementing sequences (though Prisma uses CUID, not auto-increment):
-- This is mainly for reference, as Prisma uses CUID strings, not auto-increment IDs

