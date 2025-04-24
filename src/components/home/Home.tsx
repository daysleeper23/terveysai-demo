import { useNavigate } from "react-router";
import { CardContent, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";
import useGenericStore from "../../data/store";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Globe, Shield, ClipboardList, CheckCircle } from "lucide-react";
import ChooseSender from "./ChooseSender";

const languages = ["English", "Finnish", "Swedish", "Hindi"];

const Home = () => {
  const navigate = useNavigate();
  const { currentSenderId, setCurrentSenderId } = useGenericStore();

  useEffect(() => {
    setCurrentSenderId(null);
  }, []);

  const handleSenderSelect = async (senderId: string) => {
    setCurrentSenderId(senderId);
    navigate("/chat");
  };

  return (
    <>
      <CardHeader className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col gap-4 items-center align-middle w-full">
          <div className="relative">
            <img
              className="w-28 h-28 rounded-full object-cover shadow-md border-2 border-primary/20"
              src="https://images.unsplash.com/photo-1638202993928-7267aad84c31?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="TerveysAI Logo"
            />
            <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1 rounded-full">
              <Shield className="h-5 w-5" />
            </div>
          </div>

          <div className="text-center">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
              TerveysAI
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Your AI-powered health assistant
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-3">
            <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              HIPAA Compliant
            </div>
            <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Encrypted Data
            </div>
            <div className="flex items-center bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs">
              <ClipboardList className="h-3 w-3 mr-1" />
              Medically Reviewed
            </div>
          </div>
        </div>
      </CardHeader>

      <Separator className="mb-6" />

      <CardContent className="flex flex-col gap-10 flex-1 overflow-y-auto w-full items-center">
        <ChooseLanguage />

        {currentSenderId === null && (
          <ChooseSender onChooseSender={handleSenderSelect} />
        )}

        <div className="text-xs text-center text-muted-foreground mt-auto">
          <p className="max-w-md mx-auto">
            TerveysAI provides preliminary health information but does not
            replace professional medical advice. Always consult with a
            healthcare provider for medical concerns.
          </p>
          <div className="flex justify-center gap-4 mt-3">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:underline">
              Terms of Use
            </a>
            <a href="#" className="hover:underline">
              Contact Support
            </a>
          </div>
        </div>
      </CardContent>
    </>
  );
};

export default Home;

const ChooseLanguage = () => {
  const setLanguage = useGenericStore((state) => state.setLanguage);
  const language = useGenericStore((state) => state.language);

  return (
    <div className="flex flex-col gap-3 items-center w-full">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium text-gray-600">
          Select your preferred language
        </p>
      </div>

      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue placeholder="Select your language" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {languages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
