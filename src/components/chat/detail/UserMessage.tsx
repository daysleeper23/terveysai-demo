import { Message } from "@/data/types";

const UserMessage = ({ message }: { message: Message }) => {
  return (
    <div className="flex flex-row-reverse w-fit gap-2 rounded-md border p-3 bg-blue-800 text-muted">
      <div className="text-sm">{message.content}</div>
    </div>
  );
};
export default UserMessage;
