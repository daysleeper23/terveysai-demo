import z from "zod";

export const MessageSchema = z.object({
  id: z.string().uuid(),
  senderId: z.string().uuid(),
  convoId: z.string().uuid(),
  content: z.string().nonempty({ message: "Message content cannot be empty" }),
  createdAt: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;
