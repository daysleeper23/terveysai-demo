// messageService.js
import { Message, MessageSchema, OpenAIRoles } from "@/data/types";
import io, { Socket } from "socket.io-client";
import openAIClient from "./openAI";

// URL of your Socket.IO server (adjust as needed)
const SOCKET_SERVER_URL = "http://localhost:3001";

const instructions = `
You are a virtual nurse with years of practical experience in a hospital setting. You are specialized in diabetes and asthma.
Your role is to greet patients warmly, gather their symptoms in detail, and analyze any additional electronic health record (EHR) data provided in JSON format. 
When the user sends you JSON data along with their symptom description, review the data carefully and incorporate its details into your advice but not explicitly mentioned that in the first message. 
Always ask clarifying questions if needed and remind the patient that your guidance is preliminary and not a substitute for professional medical evaluation.
Only ask one question at a time to avoid overwhelming the patient.
You are not a doctor, but you can provide advice based on the symptoms described and the EHR data.
You can also provide self-care recommendations and help reduce wait times.
Your goal is to collect as much information as possible to assist the patient effectively.
The patient's biometrics data can also be found in the EHR data.
If the user needs emergency assistance, ask them if they need help calling 112, since you already know their address from the EHR data. Confirm their address before proceeding.
After the user has no further questions, automatically send a summary of the conversation highlighting the patient's symptoms, the EHR data provided, and any recommendations or advice given to the conversation as the final message.
In the summary, include the severity level of the patient's condition based on the symptoms and EHR data (Low, Medium, High, Urgent).
Use markdown in your responses to format the text, including headings, lists, and code blocks to highlight important details.
`;

export class MessageService {
  private socket: Socket;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();
  private currentConvo: string | null = import.meta.env.VITE_DEFAULT_CONVO_ID;

  constructor() {
    // Create a socket instance with autoConnect set to false
    this.socket = io(SOCKET_SERVER_URL, {
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("Connected to messaging server");
      if (this.currentConvo) {
        this.joinConvo(this.currentConvo);
      }

      this.notifyListeners("connect", null);
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from messaging server");
      this.notifyListeners("disconnect", null);
    });

    // Set up listeners for task events
    this.socket.on("message_sent", (message: Message) => {
      const parsedMessage = MessageSchema.safeParse(message);
      if (parsedMessage.success) {
        this.notifyListeners("message_sent", parsedMessage.data);
      }
    });

    this.socket.on("error", (error: any) => {
      this.notifyListeners("error", error);
    });
  }

  async initOpenAIChat(ehr: string, convoId: string) {
    const messages = [
      {
        role: OpenAIRoles.DEVELOPER,
        content: instructions,
      },
      {
        role: OpenAIRoles.USER,
        content: `I have the following EHR data: ${ehr}, please welcome me using my name.`,
      },
    ];

    const response = await openAIClient.responses.create({
      model: "gpt-4o",
      input: messages,
    });
    console.log("received the first message", response.output_text);

    this.notifyListeners("message_sent", {
      id: crypto.randomUUID(),
      senderId: import.meta.env.VITE_DEFAULT_SYSTEM_ID,
      convoId: convoId,
      createdAt: new Date().toISOString(),
      content: response.output_text,
      previousResponseId: response.id,
    });
  }

  async sendOpenAIMessage(message: Message) {
    const messages = [
      {
        role: OpenAIRoles.DEVELOPER,
        content: instructions,
      },
      {
        role: OpenAIRoles.USER,
        content: message.content,
      },
    ];
    console.log(
      "sending message with previousResponseId",
      message.previousResponseId,
    );

    const response = await openAIClient.responses.create({
      model: "gpt-4o",
      previous_response_id: message.previousResponseId,
      input: messages,
    });

    console.log("receiving message with id", response.id);

    this.notifyListeners("message_sent", {
      id: crypto.randomUUID(),
      senderId: import.meta.env.VITE_DEFAULT_SYSTEM_ID,
      convoId: message.convoId,
      createdAt: new Date().toISOString(),
      content: response.output_text,
      previousResponseId: response.id,
    });
  }

  // Join a convo room to receive messages
  joinConvo(convoId: string): void {
    if (this.socket.connected) {
      this.socket.emit("join_convo", convoId);
      this.currentConvo = convoId;
    }
  }

  // Leave a team room
  leaveConvo(convoId: string): void {
    this.socket.emit("leave_convo", convoId);
    if (this.currentConvo === convoId) {
      this.currentConvo = null;
    }
  }

  // Add event listener
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  // Remove event listener
  off(event: string, callback: (data: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  // Notify all listeners of an event
  private notifyListeners(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Disconnect from the server
  disconnect(): void {
    this.socket.disconnect();
  }

  // Send a message to the server
  sendMessage(message: Message) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("message_sent", message);
    } else {
      console.error("Socket not connected. Cannot send message.");
    }
  }
}

// Export a singleton instance of the MessageService
const messageService = new MessageService();
export default messageService;
