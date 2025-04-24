import { useEffect, useRef, useState } from "react";
import { CardContent, CardHeader } from "../../ui/card";
import { Conversation, Message } from "../../../data/types";
import { Separator } from "../../ui/separator";
import { Button } from "../../ui/button";
import messageService from "../../../service/messageService";
import { db } from "../../../data/db";
import { useNavigate, useParams } from "react-router";

import { ArrowLeft } from "lucide-react";
import useGenericStore from "@/data/store";
import ChatInput from "./ChatInput";
import EHR from "@/data/mock/ehr.json";

import UserMessage from "./UserMessage";
import BotMessage from "./BotMessage";

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
    }
    fetchMessagesAndPrevResponseId();
    messageService.joinConvo(convoId);
    messageService.on("message_sent", handleReceiveMessage);
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

  return (
    <>
      <CardHeader className="flex gap-4 items-center">
        <Button size="icon" variant="outline" onClick={() => navigate("/chat")}>
          <ArrowLeft />
        </Button>
        <Separator orientation="vertical" className="h-8" />
        <div className="font-semibold">{convo?.name}</div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-4 flex-1 overflow-y-auto w-full items-end">
        {messages.map((message) =>
          message.senderId === senderId ? (
            <UserMessage key={message.id} message={message} />
          ) : (
            <BotMessage key={message.id} message={message} />
          )
        )}
        <div ref={chatHistoryRef} />
      </CardContent>
      <Separator />
      <ChatInput
        message={message}
        onMessageChange={setMessage}
        onSendMessage={handleSendMessage}
      />
    </>
  );
};
export default ChatDetail;
