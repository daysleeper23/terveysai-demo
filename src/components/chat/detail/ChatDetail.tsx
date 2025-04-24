import { useEffect, useRef, useState } from "react";
import { CardContent, CardFooter, CardHeader } from "../../ui/card";
import { Conversation, Message } from "../../../data/types";
import { Separator } from "../../ui/separator";
import { Button } from "../../ui/button";
import messageService from "../../../service/messageService";
import { db } from "../../../data/db";
import { useNavigate, useParams } from "react-router";

import { ArrowLeft, Clock, Info, ShieldCheck, Stethoscope } from "lucide-react";
import useGenericStore from "@/data/store";
import ChatInput from "./ChatInput";
import EHR from "@/data/mock/ehr.json";

import UserMessage from "./UserMessage";
import BotMessage from "./BotMessage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const ChatDetail = () => {
  const navigate = useNavigate();

  const {
    currentSenderId: senderId,
    previousResponseId,
    setPreviousResponseId,
  } = useGenericStore();

  if (!senderId || senderId === "" || senderId === null) {
    navigate("/");
    return;
  }

  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [convo, setConvo] = useState<Conversation>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const chatHistoryRef = useRef<HTMLDivElement | null>(null);

  const convoId = useParams().convoId || import.meta.env.VITE_DEFAULT_CONVO_ID;
  // const botId = import.meta.env.VITE_DEFAULT_SYSTEM_ID;
  const EHRJSON = JSON.stringify(EHR[senderId as keyof typeof EHR]);

  useEffect(() => {
    // Check if the senderId is set, if not redirect to home
    if (!senderId || senderId === "") {
      console.log("senderId is not set, redirecting to home");
      navigate("/");
      return;
    }

    async function fetchMessagesAndPrevResponseId() {
      setIsLoading(true);
      // Fetch the list of messages from the database
      try {
        if (db) {
          const allMessages = await db.messages
            .where("convoId")
            .equals(convoId)
            .sortBy("createdAt");

          if (allMessages.length === 0) {
            console.log("no messages found, initializing chat");
            // Initialize the chat with a welcome message
            await messageService.initOpenAIChat(EHRJSON, convoId);
          } else {
            setMessages(allMessages);
          }

          const convo = await db.conversations
            .where("id")
            .equals(convoId)
            .first();

          if (convo) {
            setConvo(convo);
            setPreviousResponseId(convo.previousResponseId || "");
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMessagesAndPrevResponseId();
    messageService.joinConvo(convoId);
    messageService.on("message_sent", handleReceiveMessage);

    // Cleanup function
    return () => {
      messageService.off("message_sent", handleReceiveMessage);
      messageService.leaveConvo(convoId);
    };
  }, [convoId]);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollIntoView();
    }
  }, [messages]);

  const handleSendMessage = async () => {
    // Handle sending the message
    const messageId = crypto.randomUUID();
    const time = new Date().toISOString();
    messageService.sendOpenAIMessage({
      id: messageId,
      senderId: senderId,
      convoId: convoId,
      content: message,
      createdAt: time,
      ...(previousResponseId ? { previousResponseId } : {}),
    });

    // Extract symptoms from the message
    const symptoms = messageService.extractSymptomsFromText(message);
    if (symptoms.length > 0) {
      const currentConvo = await db.conversations.get(convoId);
      let updatedSymptoms = symptoms;

      // If there are existing symptoms, combine them with new ones
      if (currentConvo && currentConvo.symptoms) {
        const existingSymptoms = currentConvo.symptoms.split(", ");
        // Create a Set to remove duplicates
        const symptomSet = new Set([...existingSymptoms, ...symptoms]);
        updatedSymptoms = Array.from(symptomSet);
      }

      // Update with combined symptoms
      await db.conversations.update(convoId, {
        symptoms: updatedSymptoms.join(", "),
      });
    }

    await db.messages.add({
      id: messageId,
      senderId: senderId,
      convoId: convoId,
      content: message,
      createdAt: time,
      ...(previousResponseId ? { previousResponseId } : {}),
    });
    // Reset the message input
    setMessage("");
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: messageId,
        senderId: senderId,
        convoId: convoId,
        content: message,
        createdAt: time,
        previousResponseId: previousResponseId || "",
      },
    ]);
  };

  const handleReceiveMessage = async (message: Message) => {
    console.log("Received message:", message.content);

    // Update the previousResponseId in the store
    setPreviousResponseId(message.previousResponseId!);

    // Update the previousResponseId for the conversation in the database
    await db.conversations.update(message.convoId, {
      previousResponseId: message.previousResponseId,
      lastMessage: message.content,
    });

    // Check if the message already exists in the database
    const existingMessage = await db.messages
      .where("id")
      .equals(message.id)
      .first();
    if (existingMessage) {
      // If the message already exists, update it
      await db.messages.update(message.id, {
        content: message.content,
        createdAt: message.createdAt,
        previousResponseId: message.previousResponseId,
      });
    } else {
      await db.messages.add(message);
    }

    // Update the messages state
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const getFormattedDate = () => {
    return convo?.createdAt
      ? new Date(convo.createdAt).toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        })
      : "";
  };

  return (
    <>
      <CardHeader className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="outline"
            onClick={() => navigate("/chat")}
            aria-label="Back to consultations"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1">
            <div className="font-semibold text-lg flex items-center">
              <Stethoscope className="h-5 w-5 mr-2 text-primary" />
              {convo?.name || "Medical Consultation"}
            </div>
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {getFormattedDate()}
            </div>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  <Badge
                    variant="outline"
                    className="ml-2 bg-green-50 text-green-700 border-green-200"
                  >
                    Secure
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  This consultation is encrypted and protected. Your health
                  information remains private and secure.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {convo?.symptoms && (
          <div className="text-xs bg-blue-50 p-2 rounded-md border border-blue-100 mt-2">
            <span className="font-semibold text-blue-700">
              Noted symptoms:{" "}
            </span>
            <span className="text-blue-600">{convo.symptoms}</span>
          </div>
        )}
      </CardHeader>

      <Separator />

      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="flex flex-col gap-4 w-full items-end pb-4">
            {isLoading ? (
              <div className="w-full flex justify-center p-8">
                <div className="animate-pulse text-primary">
                  Loading consultation...
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="w-full flex justify-center p-8">
                <div className="text-muted-foreground text-center">
                  Starting your consultation...
                </div>
              </div>
            ) : (
              messages.map((message) =>
                message.senderId === senderId ? (
                  <UserMessage key={message.id} message={message} />
                ) : (
                  <BotMessage key={message.id} message={message} />
                )
              )
            )}
            <div ref={chatHistoryRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <Separator />

      <CardFooter className="p-0">
        <div className="w-full">
          <ChatInput
            message={message}
            onMessageChange={setMessage}
            onSendMessage={handleSendMessage}
          />
          <div className="flex items-center justify-center p-2 text-xs text-muted-foreground">
            <Info className="h-3 w-3 mr-1" />
            This virtual consultation does not replace professional medical
            advice
          </div>
        </div>
      </CardFooter>
    </>
  );
};
export default ChatDetail;
