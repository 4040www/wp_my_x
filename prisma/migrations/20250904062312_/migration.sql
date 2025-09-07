/*
  Warnings:

  - A unique constraint covering the columns `[userId,postId]` on the table `Share` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Share_userId_postId_key" ON "public"."Share"("userId", "postId");
