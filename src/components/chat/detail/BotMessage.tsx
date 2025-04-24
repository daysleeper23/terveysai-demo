import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { terms } from "@/data/mock/terms";
import { Message } from "@/data/types";
import messageService from "@/service/messageService";
import ReactMarkdown from "react-markdown";

const BotMessage = ({ message }: { message: Message }) => {
  const termMap = Object.fromEntries(
    Object.entries(terms).map(([key, value]) => [key.toLowerCase(), value])
  );

  const renderingTooltips = (text: string) => {
    const parts: React.ReactNode[] = [];
    let remaining = text;

    Object.keys(termMap).forEach((term) => {
      const regex = new RegExp(`\\b(${term})\\b`, "gi");
      const match = remaining.match(regex);

      if (match) {
        remaining = remaining.replace(regex, (matched) => {
          parts.push(
            <TooltipProvider key={`${matched}-${Math.random()}`}>
              <Tooltip>
                <TooltipTrigger className="underline decoration-dotted cursor-help">
                  {matched}
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-sm">
                  {termMap[matched.toLowerCase()]}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
          return "¶"; // Temporary marker
        });
      }
    });

    const splitText = remaining.split("¶");
    const finalParts = splitText
      .flatMap((chunk, i) => [chunk, parts[i]])
      .filter(Boolean);

    return <>{finalParts}</>;
  };

  return (
    <div className="flex flex-row w-full gap-2 rounded-md">
      <div className="text-sm">
        {messageService.isMessageTheChatSummary(message.content) ? (
          <ReactMarkdown>{message.content}</ReactMarkdown>
        ) : (
          // <p>{message.content}</p>
          renderingTooltips(message.content)
        )}
      </div>
    </div>
  );
};
export default BotMessage;
