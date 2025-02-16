import { z } from "zod";

const subscribeSchema = z.object({
  action: z.literal("subscribe"),
  payload: z.object({
    channel: z.string(),
  }),
});

const unsubscribeSchema = z.object({
  action: z.literal("unsubscribe"),
  payload: z.object({
    channel: z.string(),
  }),
});

const changeChannelSchema = z.object({
  action: z.literal("changeChannel"),
  payload: z.object({
    oldChannel: z.string(),
    newChannel: z.string(), // now required
  }),
});

export const messageSchema = z.discriminatedUnion("action", [
  subscribeSchema,
  unsubscribeSchema,
  changeChannelSchema,
]);

export type MessageType = z.infer<typeof messageSchema>;
