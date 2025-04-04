import { useEffect, useRef, useState } from "react";
import { CardContent, CardHeader } from "../components/ui/card";
import { Message, senders } from "../data/types";
import { Separator } from "../components/ui/separator";
import { Button } from "../components/ui/button";
import messageService from "../service/messageService";
import { db } from "../data/db";
import { useNavigate, useParams } from "react-router";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import useGenericStore from "@/data/store";
import ChatInput from "./ChatInput";
import EHR from "@/data/mock/ehr.json";

const ChatHistory = () => {
  const navigate = useNavigate();

  const {
    currentSenderId: senderId,
    previousResponseId,
    setPreviousResponseId,
  } = useGenericStore();
  if (!senderId) {
    navigate("/"); // Redirect to home if senderId is not set
    return null; // Prevent rendering the component
  }

  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const chatHistoryRef = useRef<HTMLDivElement | null>(null);

  const convoId = useParams().convoId || import.meta.env.VITE_DEFAULT_CONVO_ID;
  const botId = import.meta.env.VITE_DEFAULT_SYSTEM_ID;
  const EHRJSON = JSON.stringify(EHR[senderId as keyof typeof EHR]);

  useEffect(() => {
    async function fetchMessages() {
      if (db) {
        const allMessages = await db.messages
          .where("convoId")
          .equals(convoId)
          .sortBy("createdAt");

        if (allMessages.length === 0) {
          // Initialize the chat with a welcome message
          await messageService.initOpenAIChat(EHRJSON, convoId);
        } else {
          setMessages(allMessages);
        }
      }
    }
    fetchMessages();
    messageService.joinConvo(convoId);
    messageService.on("message_sent", handleReceiveMessage);
  }, [convoId]);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollIntoView();
    }
  }, [messages]);

  // const initializeChat = async () => {
  //   const message = `Hello ${senders[senderId].name}! How can I help you?`;
  //   const time = new Date().toISOString();
  //   const messageId = crypto.randomUUID();

  //   await db.messages.add({
  //     senderId: botId,
  //     convoId: convoId,
  //     content: message,
  //     createdAt: time,
  //   });
  //   // Reset the message input
  //   setMessages((prevMessages) => [
  //     ...prevMessages,
  //     {
  //       id: messageId,
  //       senderId: botId,
  //       convoId: convoId,
  //       content: message,
  //       createdAt: time,
  //     },
  //   ]);
  // };

  const handleSendMessage = async () => {
    // Handle sending the message
    console.log("Sending message:", message);
    const messageId = Math.floor(Math.random() * 1000);
    const time = new Date().toISOString();
    messageService.sendOpenAIMessage({
      id: messageId,
      senderId: senderId,
      convoId: convoId,
      content: message,
      createdAt: time,
      ...(previousResponseId ? { previousResponseId } : {}),
    });

    await db.messages.add({
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

    // Save the message to the database
    await db.messages.add(message);

    // Update the messages state
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  return (
    <>
      <CardHeader className="flex gap-4 items-center">
        <Button size="icon" variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft />
        </Button>
        <Separator orientation="vertical" className="h-8" />
        <p></p>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-4 flex-1 overflow-y-auto w-full items-end">
        {messages.map((message) =>
          message.senderId === senderId ? (
            <UserMessage key={message.id} message={message} />
          ) : (
            <BotMessage key={message.id} message={message} />
          ),
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
export default ChatHistory;

const UserMessage = ({ message }: { message: Message }) => {
  return (
    <div className="flex flex-row-reverse w-fit gap-2 rounded-md border border-primary-80 p-3 bg-muted">
      <div className="text-sm">{message.content}</div>
    </div>
  );
};

const BotMessage = ({ message }: { message: Message }) => {
  return (
    <div className="flex flex-row w-full gap-2 rounded-md bg-card">
      <div className="text-sm">
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    </div>
  );
};
