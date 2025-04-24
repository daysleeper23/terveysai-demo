import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { db } from "../../../data/db";
import { Conversation } from "../../../data/types";
import useGenericStore from "@/data/store";
import { programs } from "@/data/mock/programs";

import { Button } from "../../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardContent } from "../../ui/card";

import messageService from "../../../service/messageService";

import ProgramSelect from "@/components/coaching/ProgramsSelect";
import ChatItem from "./ChatItem";

const ChatHistory = () => {
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
    // const createdAt = new Date().toISOString();
    messageService.joinConvo(convoId);
    // Save the conversation to the database
    await db.conversations.add({
      id: convoId,
      name:
        "Conversation on " +
        new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          dayPeriod: "narrow",
        }),
      senderId: senderId || import.meta.env.VITE_DEFAULT_SENDER_ID,
      createdAt: new Date().toISOString(),
    });

    // Navigate to the chat page
    navigate("/chat/" + convoId);
  };

  return (
    <CardContent className="flex flex-col gap-10 flex-1 overflow-y-auto w-full items-start">
      <div className="flex justify-between items-center w-full">
        <Button variant="default" size="lg" onClick={startConversation}>
          Start a new conversation
        </Button>
        <Button
          className="bg-red-200 text-red-800 hover:bg-red-300"
          variant="outline"
          size="lg"
          onClick={() => navigate("/")}
        >
          Logout
        </Button>
      </div>
      <Tabs defaultValue="chats" className="w-full">
        <TabsList>
          <TabsTrigger value="chats">Conversations</TabsTrigger>
          <TabsTrigger value="programs">Coaching Programs</TabsTrigger>
        </TabsList>
        <TabsContent value="chats">
          <div className="flex flex-col gap-6 w-full mt-8">
            <h2 className="text-2xl font-bold">Your history</h2>
            <div className="grid grid-cols-1 gap-4">
              {conversations.map((convo) => (
                <ChatItem key={convo.id} convo={convo} />
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="programs">
          <ProgramSelect programs={programs} />
        </TabsContent>
      </Tabs>
    </CardContent>
  );
};
export default ChatHistory;
