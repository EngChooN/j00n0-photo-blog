-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "caption" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "takenAt" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Backfill: each existing Photo row becomes one Post (id prefixed with 'p_').
INSERT INTO "Post" ("id", "title", "caption", "location", "takenAt", "createdAt")
SELECT 'p_' || "id", "title", "caption", "location", "takenAt", "createdAt"
FROM "Photo";

-- RedefineTable: rebuild Photo with new schema (postId FK, position, drop metadata).
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Photo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Photo_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Photo" ("id", "postId", "src", "width", "height", "position", "createdAt")
SELECT "id", 'p_' || "id", "src", "width", "height", 0, "createdAt"
FROM "Photo";

DROP TABLE "Photo";
ALTER TABLE "new_Photo" RENAME TO "Photo";

CREATE INDEX "Photo_postId_position_idx" ON "Photo"("postId", "position");

PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");
