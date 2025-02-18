/*
  Warnings:

  - Made the column `description` on table `Chat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nickname` on table `Chat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `preferred_language` on table `Chat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `profile_picture` on table `Chat` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nickname" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "profile_picture" TEXT NOT NULL,
    "preferred_language" TEXT NOT NULL
);
INSERT INTO "new_Chat" ("description", "id", "nickname", "preferred_language", "profile_picture") SELECT "description", "id", "nickname", "preferred_language", "profile_picture" FROM "Chat";
DROP TABLE "Chat";
ALTER TABLE "new_Chat" RENAME TO "Chat";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
