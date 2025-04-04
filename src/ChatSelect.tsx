import { useEffect, useState } from "react";
import { CardContent } from "./components/ui/card";
import { db } from "./data/db";
import { Conversation } from "./data/types";
import { Button } from "./components/ui/button";
import messageService from "./service/messageService";
import { useNavigate } from "react-router";

const ChatSelect = ({ senderId }: { senderId: Conversation["senderId"] }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchConvos() {
      // Fetch the list of conversations from the database
      const allConvos = await db.conversations
        .where("senderId")
        .equals(senderId)
        .toArray();
      setConversations(allConvos);
    }
    fetchConvos();
  }, []);
  return (
    <CardContent className="flex flex-col gap-4 flex-1 overflow-y-auto w-full items-start">
      <h2 className="text-2xl font-bold">You previous conversations</h2>
      {conversations.map((convo) => (
        <Button
          key={convo.id}
          variant="outline"
          onClick={() => {
            // Start a new conversation
            messageService.joinConvo(convo.id);
            navigate("/chat/" + convo.id);
            // Reset the messages state
          }}
        >
          {convo.name}
        </Button>
      ))}
    </CardContent>
  );
};
export default ChatSelect;
