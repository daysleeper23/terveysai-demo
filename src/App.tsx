import { useEffect, useRef, useState } from "react";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "./components/ui/card";
import { Separator } from "./components/ui/separator";
import { Textarea } from "./components/ui/textarea";
import messageService from "./service/messageService";
import { db } from "./data/db";
import { Message } from "./data/types";

function App() {
  const [message, setMessage] = useState<string>("");
  const senderId = import.meta.env.VITE_DEFAULT_SENDER_ID;
  const convoId = import.meta.env.VITE_DEFAULT_CONVO_ID;
  const [messages, setMessages] = useState<any[]>([]);
  const chatHistoryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      if (!!db) {
        const allMessages = await db.messages
        .where("convoId")
        .equals(convoId)
        .sortBy("createdAt");
      setMessages(allMessages);
      }
    }
    fetchMessages();
    messageService.joinConvo(convoId);
    messageService.on("message_sent", handleReceiveMessage);
  }, []);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollIntoView();
    }
  }, [messages]);

  const handleSendMessage = async () => {
    // Handle sending the message
    console.log("Sending message:", message);
    const messageId = crypto.randomUUID();
    const time = new Date().toISOString();
    messageService.sendMessage({
      id: messageId,
      senderId: senderId,
      convoId: convoId,
      content: message,
      createdAt: time,
    });

    await db.messages.add({
      senderId: senderId,
      convoId: convoId,
      content: message,
      createdAt: time,
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
      },
    ]);
  };

  const handleReceiveMessage = async (message: Message) => {
    console.log("Received message:", message.content);
    // Save the message to the database
    await db.messages.add(message);
    // Update the messages state
    setMessages((prevMessages) => [...prevMessages, message]);
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-2 overflow-hidden">
      <Card className="flex-1 h-full overflow-auto">
        <CardHeader className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              TerveysAI - Virtual Nurse
            </h1>
            <p className="text-xl text-muted-foreground">
              You don't have to wait at all.
            </p>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col gap-4 flex-1 overflow-y-auto w-full items-end">
          {messages.map((message) => (
            message.senderId === senderId ? (
              <UserMessage key={message.id} message={message} />
            ) : (
              <BotMessage key={message.id} message={message} />
            )
          ))}
          <div ref={chatHistoryRef} />
        </CardContent>
        <Separator />
        <CardFooter className="flex gap-4">
          <Textarea
            placeholder="Type your message here."
            className="resize-none"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" && // Check if the key pressed is "Enter"
                !event.shiftKey && // Ensure Shift is not pressed
                !event.ctrlKey && // Ensure Ctrl is not pressed
                !event.metaKey && // Ensure Meta (Command on Mac) is not pressed
                !event.altKey // Ensure Alt is not pressed
              ) {
                event.preventDefault(); // Prevents the default behavior of adding a new line
                if (message.trim().length > 0) {
                  // Ensure the message is not empty or just whitespace
                  handleSendMessage();
                }
              }
            }}
          />
          <Button disabled={message.length <= 0} onClick={handleSendMessage}>
            Send
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default App;

const UserMessage = ({ message }: { message: Message }) => {
  return (
    <div className="flex flex-row-reverse w-fit gap-2 rounded-md border border-primary-80 p-3 bg-muted">
      <div className="text-sm">{message.content}</div>
    </div>
  );
}

const BotMessage = ({ message }: { message: Message }) => {
  return (
    <div className="flex flex-row w-fit gap-2 rounded-md bg-card">
      <div className="text-sm">{message.content}</div>
    </div>
  );
}