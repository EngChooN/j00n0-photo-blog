-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ViewRecord" (
    "postId" TEXT NOT NULL,
    "visitorIpHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ViewRecord_pkey" PRIMARY KEY ("postId","visitorIpHash")
);

-- AddForeignKey
ALTER TABLE "ViewRecord" ADD CONSTRAINT "ViewRecord_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
