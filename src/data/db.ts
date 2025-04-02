// db.ts
import Dexie, { type EntityTable } from "dexie";
import { Message } from "./types";

const db = new Dexie("TerveysAIMessageDatabase") as Dexie & {
  messages: EntityTable<
    Message,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  messages: "id, senderId, convoId, content, createdAt", // primary key "id" (for the runtime!)
});

export { db };
