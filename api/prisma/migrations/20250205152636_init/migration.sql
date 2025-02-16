/*
  Warnings:

  - A unique constraint covering the columns `[conversation_id,user_id]` on the table `UserConversation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Conversation` ADD COLUMN `order_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX `UserConversation_conversation_id_user_id_key` ON `UserConversation`(`conversation_id`, `user_id`);
