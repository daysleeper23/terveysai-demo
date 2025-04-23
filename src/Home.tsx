import { useNavigate } from "react-router";

import { Button } from "./components/ui/button";
import { CardContent, CardHeader } from "./components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import { senders } from "./data/types";
import useGenericStore from "./data/store";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";

const languages = ["English", "Finnish", "Swedish", "Hindi"];

const Home = () => {
  // const convoId = crypto.randomUUID();
  const navigate = useNavigate();
  const { currentSenderId, setCurrentSenderId } = useGenericStore();

  useEffect(() => {
    setCurrentSenderId(null);
  }, []);

  const handleSenderSelect = async (senderId: string) => {
    setCurrentSenderId(senderId);

    // Navigate to the chat page
    navigate("/chat");
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
            TerveysAI
          </h1>
          <p className="text-xl text-muted-foreground">
            Your AI-powered health assistant
          </p>
          {/* <p className="text-xl text-muted-foreground">
            You don't have to wait at all.
          </p> */}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-16 flex-1 overflow-y-auto w-full items-start">
        <ChooseLanguage />
        {currentSenderId === null && (
          <ChooseSender onChooseSender={handleSenderSelect} />
        )}
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
    <CardContent className="flex flex-col gap-4 flex-1 overflow-y-auto w-full items-center">
      <p className="text-xl text-primary font-bold">Sign In To Your Account</p>
      <div className="grid grid-cols-1 gap-4 items-center w-full">
        {Object.values(senders).map((sender) => (
          <Button
            className="h-64 text-xl flex flex-col justify-center items-center"
            key={sender.id}
            value={sender.id}
            variant={"outline"}
            onClick={(event) => {
              onChooseSender(event.currentTarget.value);
            }}
          >
            <img
              className="w-24 h-24 rounded-full object-cover object-top"
              src={sender.avatar}
            ></img>
            {sender.name}
            <div className="text-sm font-light text-muted-foreground text-wrap flex flex-col items-center">
              <p>Condition: {sender.condition}</p>
              <p>Medication: {sender.medication}</p>
            </div>
          </Button>
        ))}
      </div>
    </CardContent>
  );
};

const ChooseLanguage = () => {
  const setLanguage = useGenericStore((state) => state.setLanguage);
  const language = useGenericStore((state) => state.language);

  return (
    <div className="flex flex-col gap-4 items-center w-full">
      <p className="text-md text-muted-foreground">
        Your communication language
      </p>
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select your language" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {
              languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              )) /* Add more languages as needed */
            }
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
