import { senders } from "@/data/types";
import { ClipboardList, Pill, User } from "lucide-react";

const ChooseSender = ({
  onChooseSender,
}: {
  onChooseSender: (senderId: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full items-center">
      <div className="flex items-center gap-2 mb-1">
        <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        <h2 className="text-lg sm:text-xl text-primary font-semibold">
          Select Your Profile
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-5 w-full max-w-sm sm:max-w-none mx-auto">
        {Object.values(senders).map((sender) => (
          <button
            key={sender.id}
            value={sender.id}
            onClick={() => onChooseSender(sender.id)}
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md active:bg-gray-50 transition-all p-3 sm:p-5 flex flex-row sm:flex-col items-center text-left focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
          >
            {/* Fixed avatar sizing */}
            <img
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover object-top border-2 border-primary/10 mr-3 sm:mr-0 flex-shrink-0"
              src={sender.avatar}
              alt={`${sender.name}'s profile`}
            />

            {/* Container for text content with overflow handling */}
            <div className="sm:text-center min-w-0 flex-1 overflow-hidden">
              <div className="font-medium text-base sm:text-lg text-gray-900 mb-2 sm:mb-0 sm:mt-3 truncate">
                {sender.name}
              </div>

              <div className="flex flex-col gap-2 sm:mt-3 w-full">
                <div className="flex items-center text-xs sm:text-sm w-full min-w-0">
                  <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-0.5 sm:py-1 rounded-md w-full overflow-hidden">
                    <ClipboardList className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                    <span className="truncate">{sender.condition}</span>
                  </div>
                </div>

                <div className="flex items-center text-xs sm:text-sm w-full min-w-0">
                  <div className="flex items-center bg-purple-50 text-purple-700 px-2 py-0.5 sm:py-1 rounded-md w-full overflow-hidden">
                    <Pill className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                    <span className="truncate">{sender.medication}</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChooseSender;
