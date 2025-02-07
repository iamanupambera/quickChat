import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { auth } from "../middleware/auth";
import { validate } from "../middleware/validationMiddleware";
import {
  createConversationSchema,
  CreateConversationType,
} from "../helper/validationSchema";
import { RedisService } from "../config/redisConnection";
const redisService = RedisService.getInstance();

const conversationsRoute = Router();
const prisma = new PrismaClient();

conversationsRoute.post(
  "/",
  auth,
  validate(createConversationSchema),
  async (req, res) => {
    const currentUserId = req.user?.user_id as number;
    let { participantIds }: CreateConversationType = req.body;

    // Ensure the authenticated user is included in the conversation
    if (!participantIds.includes(currentUserId)) {
      participantIds.push(currentUserId);
    }

    if (participantIds.length < 2) {
      res.status(400).json({
        message: "invalid conversation details",
      });
      return;
    }

    // if more than 2 participants, assume GROUP; otherwise, DIRECT.
    const type = participantIds.length > 2 ? "GROUP" : "DIRECT";

    const users = await prisma.user.findMany({
      where: { user_id: { in: participantIds } },
    });

    const userConversations = users.map(({ user_id }) => {
      return { user_id };
    });

    const conversation = await prisma.conversation.create({
      data: {
        type,
        UserConversation: { createMany: { data: userConversations } },
      },
    });

    if (type === "GROUP") {
      const groupMember: { role: "ADMIN" | "MEMBER"; user_id: number }[] =
        users.map(({ user_id }) => {
          return {
            user_id,
            role: user_id === currentUserId ? "ADMIN" : "MEMBER",
          };
        });

      await prisma.group.create({
        data: {
          group_id: conversation.conversation_id,
          group_name: "untitled",
          created_by: currentUserId,
          members: { createMany: { data: groupMember } },
        },
      });
    }

    // Publish event to Redis
    await redisService.publish(
      `conversation:new:${currentUserId}`,
      JSON.stringify(conversation)
    );

    res.status(201).json({
      response: conversation,
      message: "conversation create successfully",
    });
  }
);

conversationsRoute.get("/", auth, async (req, res) => {
  const user_id = req.user?.user_id as number;
  const conversations = await prisma.conversation.findMany({
    orderBy: { order_date: "desc" },
    include: {
      UserConversation: {
        where: { user_id },
      },
      last_message: true,
    },
  });
  res
    .status(200)
    .json({ response: conversations, message: "all conversation" });
});

export default conversationsRoute;
