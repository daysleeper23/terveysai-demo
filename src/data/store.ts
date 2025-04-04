import { create } from "zustand";
import { Conversation, Message } from "./types";

interface GenericStore {
  currentSenderId: string | null;
  messages: Message[];
  convos: Conversation[];
  previousResponseId: string | null;
  setPreviousResponseId: (responseId: string | null) => void;
  setCurrentSenderId: (senderId: string | null) => void;
  setMessages: (messages: Message[]) => void;
  setConvos: (convos: Conversation[]) => void;
}

const useGenericStore = create<GenericStore>((set) => ({
  currentSenderId: null,
  messages: [],
  convos: [],
  previousResponseId: null,
  setPreviousResponseId: (responseId: string | null) =>
    set({ previousResponseId: responseId }),
  setCurrentSenderId: (senderId: string | null) => set({ currentSenderId: senderId }),
  setMessages: (messages: Message[]) => set({ messages }),
  setConvos: (convos: Conversation[]) => set({ convos }),
}));
export default useGenericStore;
