import ReactMarkdown from "react-markdown";
import Severity from "./Severity";
import Symptoms from "./Symptoms";
import messageService from "@/service/messageService";
import { UNCLEAR_SYMPTOM } from "@/data/mock/symptoms";
import { useNavigate } from "react-router";
import { Conversation } from "@/data/types";

const ChatItem = ({ convo }: { convo: Conversation }) => {
  const navigate = useNavigate();

  const summaryDetails = messageService.extractSummaryDetails(
    convo.lastMessage || ""
  );
  const severity = summaryDetails?.severity || "No severity";
  const symptoms = summaryDetails?.symptoms.join(",") || UNCLEAR_SYMPTOM;

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
export default ChatItem;
