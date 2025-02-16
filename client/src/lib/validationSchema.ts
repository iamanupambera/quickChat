import { z } from "zod";
enum MessageStatus {
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  READ = "READ",
}

export const registerSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  phone_number: z
    .string()
    .min(1, { message: "Phone number is required" })
    .regex(/^\d+$/, { message: "Phone number must contain only digits" }),
  profilePic: z.string().optional(),
});

export type RegisterType = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  phone_number: z
    .string()
    .min(1, { message: "Phone number is required" })
    .regex(/^\d+$/, { message: "Phone number must contain only digits" }),
});

export type LoginType = z.infer<typeof loginSchema>;

export const createConversationSchema = z.object({
  participantIds: z.array(z.number()).min(1),
});

export type CreateConversationType = z.infer<typeof createConversationSchema>;

export const messageSchema = z.object({
  message_content: z.string().optional(),
  file: z
    .any()
    .optional()
    .refine((file) => (file ? file.length > 0 : true), {
      message: "Invalid file",
    }),
}).refine((data) => data.message_content?.trim() || data.file?.length, {
  message: "Either message content or an image is required",
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
