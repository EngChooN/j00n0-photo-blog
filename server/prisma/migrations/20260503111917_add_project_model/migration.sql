-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ongoing', 'completed');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "projectId" TEXT;

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "concept" TEXT,
    "coverPhotoUrl" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ongoing',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Project_isPublic_status_updatedAt_idx" ON "Project"("isPublic", "status", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "Post_projectId_idx" ON "Post"("projectId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
