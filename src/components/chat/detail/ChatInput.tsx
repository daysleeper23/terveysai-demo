import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const ChatInput = ({
  message,
  onMessageChange,
  onSendMessage,
}: {
  message: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
}) => {
  return (
    <CardFooter className="flex gap-4">
      <Textarea
        placeholder="Type your message here."
        className="resize-none"
        value={message}
        onChange={(event) => onMessageChange(event.target.value)}
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
              onSendMessage();
            }
          }
        }}
      />
      <Button disabled={message.length <= 0} onClick={onSendMessage}>
        Send
      </Button>
    </CardFooter>
  );
};
export default ChatInput;
