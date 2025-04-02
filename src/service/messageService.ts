// messageService.js
import { Message, MessageSchema } from "@/data/types";
import io, { Socket } from "socket.io-client";

// URL of your Socket.IO server (adjust as needed)
const SOCKET_SERVER_URL = "http://localhost:3001";

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
        this.notifyListeners(
          "message_sent",
          parsedMessage.data,
        );
      }
      
    });

    this.socket.on("error", (error: any) => {
      this.notifyListeners("error", error);
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
