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
import { Plus, LogOut, History, Award, LucideShield } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
    messageService.joinConvo(convoId);

    // Save the conversation to the database
    await db.conversations.add({
      id: convoId,
      name:
        "Consultation on " +
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
    <CardContent className="flex flex-col gap-8 flex-1 overflow-y-auto w-full items-start">
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <LucideShield className="w-6 h-6 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-primary">
              HealthAssist Portal
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800"
            onClick={() => navigate("/")}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
        <p className="text-muted-foreground">
          Secure healthcare assistance and wellness coaching
        </p>
      </div>

      <Separator />

      <Button
        variant="default"
        size="lg"
        onClick={startConversation}
        className="bg-blue-600 hover:bg-primary/90 text-primary-foreground w-full py-6"
      >
        <Plus className="mr-2 h-5 w-5" />
        Start New Consultation
      </Button>

      <Tabs defaultValue="chats" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="chats"
            className="flex items-center justify-center"
          >
            <History className="h-4 w-4 mr-2" />
            Consultations
          </TabsTrigger>
          <TabsTrigger
            value="programs"
            className="flex items-center justify-center"
          >
            <Award className="h-4 w-4 mr-2" />
            Wellness Programs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chats" className="pt-4">
          <div className="flex flex-col gap-6 w-full mt-2">
            <h2 className="text-xl font-semibold text-primary">
              Your Consultation History
            </h2>
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                No previous consultations found.
                <br />
                Start a new consultation to get personalized healthcare
                assistance.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {conversations.map((convo) => (
                  <ChatItem key={convo.id} convo={convo} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="programs" className="pt-4">
          <div className="flex flex-col gap-4 w-full mt-2">
            <h2 className="text-xl font-semibold text-primary">
              Personalized Wellness Programs
            </h2>
            <p className="text-muted-foreground mb-2">
              Programs designed to support your health journey with
              evidence-based guidance
            </p>
            <ProgramSelect programs={programs} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="w-full mt-auto pt-4">
        <p className="text-xs text-center text-muted-foreground">
          Your health data is protected and encrypted. This service does not
          replace professional medical advice.
        </p>
      </div>
    </CardContent>
  );
};

export default ChatHistory;
