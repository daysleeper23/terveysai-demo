import { Card } from "./components/ui/card";
import ChatDetail from "./components/chat/detail/ChatDetail";
import { Route, Routes } from "react-router";
import Home from "./components/home/Home";
import ChatHistory from "./components/chat/history/ChatHistory";
import ProgramSelect from "./components/coaching/ProgramsSelect";
import { programs } from "./data/mock/programs";

function App() {
  return (
    <div className="max-w-3xl m-auto w-full h-full flex items-center justify-center p-2 overflow-hidden">
      <Card className="flex-1 h-full overflow-auto">
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/chat" element={<ChatHistory />}></Route>
          <Route path="/chat/:convoId" element={<ChatDetail />}></Route>
          <Route
            path="/programs"
            element={<ProgramSelect programs={programs} />}
          ></Route>
        </Routes>
      </Card>
    </div>
  );
}

export default App;
