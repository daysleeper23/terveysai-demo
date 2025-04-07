import { useNavigate } from "react-router";

import { Button } from "./components/ui/button";
import { CardContent, CardHeader } from "./components/ui/card";
import messageService from "./service/messageService";

import { db } from "./data/db";
import ChatSelect from "./ChatSelect";
import { Separator } from "@radix-ui/react-separator";
import { senders } from "./data/types";
import useGenericStore from "./data/store";
import { useEffect } from "react";

const Home = () => {
  const convoId = crypto.randomUUID();
  const navigate = useNavigate();
  const { currentSenderId, setCurrentSenderId } = useGenericStore();

  useEffect(() => {
    setCurrentSenderId(null);
  }
  , []);

  const handleSenderSelect = async (senderId: string) => {
    setCurrentSenderId(senderId);

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
    <>
      <CardHeader className="flex flex-col gap-6 mb-12">
        <div className="flex flex-col gap-4 items-center align-middle w-full">
          <img
            className="w-24 h-24 rounded-full"
            src="https://images.unsplash.com/photo-1638202993928-7267aad84c31?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          ></img>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            TerveysAI - Virtual Nurse
          </h1>
          {/* <p className="text-xl text-muted-foreground">
            You don't have to wait at all.
          </p> */}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-4 flex-1 overflow-y-auto w-full items-start">
        {currentSenderId === null && (
          <ChooseSender onChooseSender={handleSenderSelect} />
        )}
        {/* {currentSenderId !== null && (
          <>
            <ChatSelect senderId={currentSenderId} />
            <Button
              onClick={async () => {
                // Start a new conversation
                messageService.joinConvo(convoId);
                // Save the conversation to the database
                await db.conversations.add({
                  id: convoId,
                  name:
                    "Conversation with " +
                    senders[currentSenderId as keyof typeof senders]?.name +
                    Math.floor(Math.random() * 1000),
                  senderId:
                    currentSenderId || import.meta.env.VITE_DEFAULT_SENDER_ID,
                  createdAt: new Date().toISOString(),
                });
                // Navigate to the chat page
                navigate("/chat/" + convoId);
                // Reset the messages state
              }}
            >
              Start a new conversation
            </Button>
          </>
        )} */}
      </CardContent>
    </>
  );
};
export default Home;

const ChooseSender = ({
  onChooseSender,
}: {
  onChooseSender: (senderId: string) => void;
}) => {
  return (
    <CardContent className="flex flex-col gap-8 flex-1 overflow-y-auto w-full items-center">
      <p className="text-xl text-muted-foreground">
        Please Sign In To Your Account
      </p>
      <div className="grid grid-cols-1 gap-4 items-center w-full">
        {Object.values(senders).map((sender) => (
          <Button
            className="h-64 text-xl flex flex-col justify-center items-center"
            key={sender.id}
            value={sender.id}
            variant={"outline"}
            onClick={(event) => {
              console.log("object", event.currentTarget.value);
              onChooseSender(event.currentTarget.value);
            }}
          >
            <img className="w-24 h-24 rounded-full object-cover object-top" src={sender.avatar}></img>
            {sender.name}
            <div className="text-sm font-light text-muted-foreground text-wrap flex flex-col items-start">
              <p>Condition: {sender.condition}</p>
              <p>Medication: {sender.medication}</p>
            </div>
          </Button>
        ))}
      </div>
    </CardContent>
  );
};
