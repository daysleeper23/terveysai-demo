// db.ts
import Dexie, { type EntityTable } from "dexie";
import { Conversation, Message } from "./types";

const db = new Dexie("TerveysAIMessageDatabase") as Dexie & {
  messages: EntityTable<
    Message,
    "id" // primary key "id" (for the typings only)
  >;
  conversations: EntityTable<
    Conversation,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(2).stores({
  messages: "++id, senderId, convoId, content, createdAt, previousResponseId", // primary key "id" (for the runtime!)
  conversations:
    "++id, name, senderId, lastMessage, previousResponseId, symptoms, createdAt", // primary key "id" (for the runtime!)
});

export { db };
