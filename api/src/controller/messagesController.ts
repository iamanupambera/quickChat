import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { auth } from "../middleware/auth";
import { validate } from "../middleware/validationMiddleware";
import {
  messageSchema,
  MessageType,
  updateMessageSchema,
  UpdateMessageType,
} from "../helper/validationSchema";
import { RedisService } from "../config/redisConnection";
const redisService = RedisService.getInstance();

const messagesRoute = Router();
const prisma = new PrismaClient();

messagesRoute.post("/", auth, validate(messageSchema), async (req, res) => {
  const {
    conversation_id,
    message: { message_content, sent_at },
  }: MessageType = req.body;

  const sender_id = req.user?.user_id as number;
  const conversation = await prisma.conversation.findFirst({
    where: { conversation_id },
  });

  if (!conversation) {
    res.status(404).json({
      message: "conversation not found",
    });
    return;
  }

  const message = await prisma.message.create({
    data: {
      conversation_id,
      message_type: "TEXT",
      status: "SENT",
      message_content,
      sender_id,
      sent_at: new Date(sent_at).toISOString(),
    },
  });

  await prisma.conversation.update({
    where: {
      conversation_id,
    },
    data: {
      last_message_id: message.message_id,
      order_date: new Date(sent_at).toISOString(),
    },
  });

  await redisService.publish(
    `message:new:${conversation_id}`,
    JSON.stringify(message)
  );

  res.status(201).json({
    message: "message send successfully",
  });
});

messagesRoute.put(
  "/:messageId",
  auth,
  validate(updateMessageSchema),
  async (req, res) => {
    const { messageId } = req.params;
    const { status }: UpdateMessageType = req.body;

    const message = await prisma.message.findFirst({
      where: {
        message_id: Number(messageId),
      },
    });

    if (!message) {
      res.status(404).json({
        message: "message not found",
      });
      return;
    }

    await prisma.message.update({
      where: { message_id: Number(messageId) },
      data: { status },
    });

    await redisService.publish(
      `message:update:${message.conversation_id}`,
      JSON.stringify(message)
    );

    res.status(200).json({ message: "update successfully" });
  }
);

messagesRoute.get("/:conversationId", auth, async (req, res) => {
  const { conversationId } = req.params;
  const user_id = req.user?.user_id as number;

  const conversation = await prisma.userConversation.findFirst({
    where: { conversation_id: Number(conversationId), user_id },
  });

  if (!conversation) {
    res.status(404).json({ message: "conversation is for you" });
    return;
  }

  const messages = await prisma.message.findMany({
    where: { conversation_id: Number(conversationId) },
    orderBy: { sent_at: "asc" },
  });
  res.status(200).json({ response: messages, message: "all message" });
});

export default messagesRoute;
