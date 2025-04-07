import z from "zod";

export const MessageSchema = z.object({
  id: z.number().int().positive(),
  senderId: z.string().uuid(),
  convoId: z.string().uuid(),
  content: z.string().nonempty({ message: "Message content cannot be empty" }),
  createdAt: z.string(),
  previousResponseId: z.string().optional(),
});
export type Message = z.infer<typeof MessageSchema>;

export const ConversationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nonempty({ message: "Conversation name cannot be empty" }),
  senderId: z.string().uuid(),
  createdAt: z.string(),
});
export type Conversation = z.infer<typeof ConversationSchema>;

export const SenderSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nonempty({ message: "Sender name cannot be empty" }),
  avatar: z.string().optional(),
  condition: z.string().optional(),
  medication: z.string().optional(),
});
export type Sender = z.infer<typeof SenderSchema>;
export const senders: Record<Sender["id"], Sender> = {
  "f9590c0a-a75a-4eaa-96b3-e927bcfca823": {
    id: "f9590c0a-a75a-4eaa-96b3-e927bcfca823",
    name: "Matti",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=3000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    condition: "Type 2 Diabetes Mellitus",
    medication: "Metformin 500mg, 1 tablet twice daily with meals",
  },
  // "fb00d1db-bfed-47ed-abed-3a397f4ead5a": {
  //   id: "fb00d1db-bfed-47ed-abed-3a397f4ead5a",
  //   name: "Jussi",
  //   avatar:
  //     "https://images.unsplash.com/photo-1701503098048-671c0a40d458?q=80&w=3080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //   condition: "Asthma (Active and Confirmed since 2015)",
  //   medication: "Active prescription for Salbutamol (Inhaler).",
  // },
  // "f8f63bd5-0705-463b-8af8-d0da7787bfa0": {
  //   id: "f8f63bd5-0705-463b-8af8-d0da7787bfa0",
  //   name: "Emma",
  // },
  // "f7f80749-b7cc-4e54-9f5f-91e96ace1114": {
  //   id: "f7f80749-b7cc-4e54-9f5f-91e96ace1114",
  //   name: "Mikael",
  // },
};

export enum OpenAIRoles {
  SYSTEM = "system",
  DEVELOPER = "developer",
  USER = "user",
  ASSISTANT = "assistant",
}
