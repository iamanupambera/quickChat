import { MessageStatus } from "@prisma/client";
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string(),
  password: z.string(),
  phone_number: z.string(),
});

export type RegisterType = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  password: z.string(),
  phone_number: z.string(),
});

export type LoginType = z.infer<typeof loginSchema>;

export const createConversationSchema = z.object({
  participantIds: z.array(z.number()).min(1),
});

export type CreateConversationType = z.infer<typeof createConversationSchema>;

export const messageSchema = z.object({
  conversation_id: z.number(),
  message: z.object({
    // sender_id: z.number(),
    message_content: z.string(),
    sent_at: z.string().transform((str) => new Date(str)),
  }),
});

export type MessageType = z.infer<typeof messageSchema>;

export const updateMessageSchema = z.object({
  status: z.nativeEnum(MessageStatus),
});

export type UpdateMessageType = z.infer<typeof updateMessageSchema>;

export const updateGroupSchema = z.object({
  group_name: z.string(),
});

export type UpdateGroupType = z.infer<typeof updateGroupSchema>;
