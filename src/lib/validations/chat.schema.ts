import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
});

export const chatRequestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(24),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
