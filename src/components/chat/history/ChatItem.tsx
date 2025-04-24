import { useNavigate } from "react-router";
import {
  CalendarClock,
  MessageSquare,
  FileText,
  ChevronRight,
} from "lucide-react";
import messageService from "@/service/messageService";
import { UNCLEAR_SYMPTOM } from "@/data/mock/symptoms";
import { Conversation } from "@/data/types";
import Severity from "./Severity";
import Symptoms from "./Symptoms";
import { formatDistanceToNow } from "date-fns";

const ChatItem = ({ convo }: { convo: Conversation }) => {
  const navigate = useNavigate();

  const summaryDetails = messageService.extractSummaryDetails(
    convo.lastMessage || ""
  );
  const severity = summaryDetails?.severity || "Low";
  const symptoms = summaryDetails?.symptoms.join(", ") || UNCLEAR_SYMPTOM;

  // Get time relative to now (e.g., "2 days ago")
  const timeAgo = formatDistanceToNow(new Date(convo.createdAt), {
    addSuffix: true,
  });

  // Format the absolute date in a more professional way
  const formattedDate = new Date(convo.createdAt).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  // Truncate and prepare the last message for preview
  const lastMessagePreview =
    (convo.lastMessage || "")
      .replace(/\*\*/g, "") // Remove markdown bold
      .replace(/\n/g, " ") // Replace newlines with spaces
      .replace(/#+\s/g, "") // Remove markdown headers
      .replace(/\[|\]/g, "") // Remove markdown links
      .slice(0, 100) + // Shorter preview for mobile
    (convo.lastMessage && convo.lastMessage.length > 100 ? "..." : "");

  return (
    <div
      key={convo.id}
      onClick={() => {
        messageService.joinConvo(convo.id);
        navigate("/chat/" + convo.id);
      }}
      className="relative flex flex-col border rounded-lg shadow-sm hover:shadow-md active:bg-gray-50 transition-all duration-150 cursor-pointer bg-white overflow-hidden"
    >
      {/* Header section with title and severity */}
      <div className="flex flex-col p-3 pb-2 sm:p-4 sm:pb-3">
        <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
          <div className="flex items-center max-w-[80%]">
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary mr-1.5 sm:mr-2 flex-shrink-0" />
            <h3 className="font-medium text-xs sm:text-sm text-gray-900 line-clamp-1">
              {convo.name || "Medical Consultation"}
            </h3>
          </div>
          <div className="flex-shrink-0">
            <Severity severity={severity} />
          </div>
        </div>

        {/* Symptoms with improved mobile display */}
        <div className="mb-1.5 sm:mb-2">
          <Symptoms symptoms={symptoms} />
        </div>

        {/* Footer with time and action hint */}
        <div className="flex justify-between items-center">
          <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground">
            <CalendarClock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 text-gray-400" />
            <span title={formattedDate}>{timeAgo}</span>
          </div>

          <div className="flex items-center text-[10px] sm:text-xs text-primary">
            <span className="hidden sm:inline">View details</span>
            <span className="sm:hidden">Details</span>
            <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 ml-0.5 sm:ml-1" />
          </div>
        </div>
      </div>

      {/* Last message preview - conditionally shown with better mobile sizing */}
      {convo.lastMessage && (
        <div className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm border-t border-gray-100 bg-gray-50">
          <div className="flex items-start">
            <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-gray-600 line-clamp-1 sm:line-clamp-2">
              {lastMessagePreview}
            </p>
          </div>
        </div>
      )}

      {/* Mobile-friendly touch target overlay for better tap experience */}
      <div className="absolute inset-0 w-full h-full" aria-hidden="true"></div>
    </div>
  );
};

export default ChatItem;
