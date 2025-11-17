-- AlterTable
ALTER TABLE "conversation" ADD COLUMN     "authorId" TEXT;

-- AlterTable
ALTER TABLE "message" ADD COLUMN     "authorId" TEXT;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
