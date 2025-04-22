import { useEffect, useState } from "react";
import { CardContent } from "../components/ui/card";
import { db } from "../data/db";
import { Conversation, senders } from "../data/types";
import { Button } from "../components/ui/button";
import messageService from "../service/messageService";
import { useNavigate } from "react-router";
import useGenericStore from "@/data/store";
import ReactMarkdown from "react-markdown";

const ChatSelect = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const navigate = useNavigate();
  const { currentSenderId: senderId } = useGenericStore();

  useEffect(() => {
    async function fetchConvos() {
      if (!senderId) {
        return;
      }
      console.log("senderId", senderId);

      // Fetch the list of conversations from the database
      const allConvos = await db.conversations
        .where("senderId")
        .equals(senderId)
        .toArray();
      setConversations(allConvos);
    }
    fetchConvos();
  }, []);

  const startConversation = async () => {
    const convoId = crypto.randomUUID();
    messageService.joinConvo(convoId);
    // Save the conversation to the database
    await db.conversations.add({
      id: convoId,
      name:
        "Conversation with " +
        senders[senderId as keyof typeof senders]?.name +
        Math.floor(Math.random() * 1000),
      senderId: senderId || import.meta.env.VITE_DEFAULT_SENDER_ID,
      createdAt: new Date().toISOString(),
    });

    // Navigate to the chat page
    navigate("/chat/" + convoId);
  };

  return (
    <CardContent className="flex flex-col gap-8 flex-1 overflow-y-auto w-full items-start">
      <Button variant="default" size="lg" onClick={startConversation}>
        Start a new conversation
      </Button>
      <h2 className="text-2xl font-bold">You ongoing conversations</h2>
      {conversations.map((convo) => (
        <ChatItem key={convo.id} convo={convo} />
      ))}
    </CardContent>
  );
};
export default ChatSelect;

const ChatItem = ({ convo }: { convo: Conversation }) => {
  const navigate = useNavigate();

  return (
    <div
      key={convo.id}
      onClick={() => {
        // Start a new conversation
        messageService.joinConvo(convo.id);
        navigate("/chat/" + convo.id);
      }}
      className="flex items-center justify-between p-4 border rounded-md border-b-slate-200 hover:bg-slate-100 cursor-pointer"
    >
      <div className="flex flex-col gap-2">
        <div className="text-lg font-semibold border-b py-4">
          {convo.createdAt}
        </div>
        <ReactMarkdown>{convo.lastMessage || ""}</ReactMarkdown>
      </div>
    </div>
  );
};
