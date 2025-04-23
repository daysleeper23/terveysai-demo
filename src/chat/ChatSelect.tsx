import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ReactMarkdown from "react-markdown";

import { db } from "../data/db";
import { Conversation } from "../data/types";

import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardContent } from "../components/ui/card";

import messageService from "../service/messageService";

import useGenericStore from "@/data/store";

import { programs } from "@/data/mock/programs";
import ProgramSelect from "@/coaching/ProgramsSelect";

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
export default ChatSelect;

const ChatItem = ({ convo }: { convo: Conversation }) => {
  const navigate = useNavigate();
  console.log(convo.symptoms!!);

  const summaryDetails = messageService.extractSummaryDetails(
    convo.lastMessage || ""
  );
  console.log(summaryDetails);
  const severity = summaryDetails?.severity || "No severity";
  const symptoms = summaryDetails?.symptoms.join(",") || "";

  return (
    <div
      key={convo.id}
      onClick={() => {
        // Start a new conversation
        messageService.joinConvo(convo.id);
        navigate("/chat/" + convo.id);
      }}
      className="flex flex-col gap-4 justify-start border rounded-md border-b-slate-200 hover:bg-slate-100 cursor-pointer"
    >
      <div className="flex flex-col gap-4 p-4 border-b">
        <Severity severity={severity} />
        <Symptoms symptoms={symptoms} />
        <div className="text-xs text-muted-foreground">
          {new Date(convo.createdAt).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
          })}
        </div>
      </div>
      <div className="px-4 pb-4 text-sm">
        <ReactMarkdown>{convo.lastMessage || ""}</ReactMarkdown>
      </div>
    </div>
  );
};

const Severity = ({ severity }: { severity: string }) => {
  console.log("severity", severity);
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">
        Severity
      </span>
      {severity === "Low" ? (
        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold">
          {severity}
        </span>
      ) : severity === "Medium" ? (
        <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-semibold">
          {severity}
        </span>
      ) : severity === "High" ? (
        <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-semibold">
          {severity}
        </span>
      ) : severity === "Urgent" ? (
        <span className="inline-block px-2 py-1 bg-red-500 text-white rounded text-sm font-semibold">
          {severity}
        </span>
      ) : (
        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-semibold">
          {severity}
        </span>
      )}
    </div>
  );
};

const Symptoms = ({ symptoms }: { symptoms: string | undefined }) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">
        Symptoms
      </span>
      <div className="flex flex-wrap gap-2">
        {symptoms !== undefined ? (
          symptoms?.split(",").map((symptom, i) => (
            <span
              key={i}
              className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm font-semibold"
            >
              {symptom}
            </span>
          ))
        ) : (
          <span className="inline-block px-2 py-1 bg-slate-100 text-slate-800 rounded text-sm font-semibold">
            Unclear symptoms
          </span>
        )}
      </div>
    </div>
  );
};
