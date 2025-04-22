import { Card } from "./components/ui/card";
import ChatHistory from "./chat/ChatHistory";
import { Route, Routes } from "react-router";
import Home from "./Home";
import ChatSelect from "./chat/ChatSelect";

function App() {
  const senderId = import.meta.env.VITE_DEFAULT_SENDER_ID;

  return (
    <div className="w-full h-full flex items-center justify-center p-2 overflow-hidden">
      <Card className="flex-1 h-full overflow-auto">
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/chat" element={<ChatSelect />}></Route>
          <Route path="/chat/:convoId" element={<ChatHistory />}></Route>
        </Routes>
      </Card>
    </div>
  );
}

export default App;
