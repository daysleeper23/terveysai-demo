import { Message, MessageSchema, OpenAIRoles } from "@/data/types";
import openAIClient from "./openAI";
import useGenericStore from "@/data/store";
import { symptomsKeywords } from "@/data/mock/symptoms";
import { db } from "@/data/db";

const instructions = `
  You are a virtual nurse with years of practical experience in a hospital setting. You are specialized in diabetes and asthma.
  You are fluent in multiple languages.
  Your role is to greet patients warmly, gather their symptoms in detail, and analyze any additional electronic health record (EHR) data provided in JSON format. 
  When the user sends you JSON data along with their symptom description, review the data carefully and incorporate its details into your advice but not explicitly mentioned that in the first message. 
  Always ask clarifying questions if needed and remind the patient that your guidance is preliminary and not a substitute for professional medical evaluation.
  Only ask one question at a time to avoid overwhelming the patient.
  You are not a doctor, but you can provide advice based on the symptoms described and the EHR data.
  You can also provide self-care recommendations and help reduce wait times.
  Your goal is to collect as much information as possible to assist the patient effectively.
  The patient's biometrics data can also be found in the EHR data (Body Temperature, Heart Rate, Blood Oxygen, Blood Pressure, Blood Glucose)
  If the user needs emergency assistance, ask them if they need help calling 112, since you already know their address from the EHR data. Confirm their address before proceeding.
  After the user has no further questions, automatically send a summary of the conversation highlighting the patient's symptoms, the EHR data provided, and any recommendations or advice given to the conversation as the final message.
  Always start the summary message with "Summary of our conversation:".
  In the summary, include the severity level of the patient's condition based on the symptoms and EHR data (Low, Medium, High, Urgent) with this description text "Severity Level:".
  Use markdown in your responses to format the text, including headings, lists, and code blocks to highlight important details.
`;

export class MessageService {
  private listeners: Map<string, Array<(data: any) => void>> = new Map();
  private currentConvo: string | null = import.meta.env.VITE_DEFAULT_CONVO_ID;

  constructor() {
    // Simulate connection status
    this.notifyListeners("connect", null);
    console.log("Local message service initialized");
  }

  async initOpenAIChat(ehr: string, convoId: string) {
    const language = useGenericStore.getState().language;
    console.log("language", language);

    try {
      const messages = [
        {
          role: OpenAIRoles.DEVELOPER,
          content: instructions,
        },
        {
          role: OpenAIRoles.USER,
          content: `I have the following EHR data: ${ehr}, please welcome me using my name. Please use ${language} to communicate with me.`,
        },
      ];

      const response = await openAIClient.responses.create({
        model: "gpt-4o",
        input: messages,
      });
      console.log("received the first message", response.output_text);

      const newMessage = {
        id: crypto.randomUUID(),
        senderId: import.meta.env.VITE_DEFAULT_SYSTEM_ID,
        convoId: convoId,
        createdAt: new Date().toISOString(),
        content: response.output_text,
        previousResponseId: response.id,
      };

      // Store in IndexedDB
      await db.messages.add(newMessage);

      this.notifyListeners("message_sent", newMessage);
    } catch (error) {
      console.error("Error initializing OpenAI chat:", error);
      this.notifyListeners("error", error);
    }
  }

  async sendOpenAIMessage(message: Message) {
    try {
      // First, save the user's message to IndexedDB
      await db.messages.add(message);

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
        message.previousResponseId
      );

      const response = await openAIClient.responses.create({
        model: "gpt-4o",
        previous_response_id: message.previousResponseId,
        input: messages,
      });

      console.log("receiving message with id", response.id);
      console.log(
        "analyzing",
        this.extractSummaryDetails(response.output_text)
      );

      const botResponse = {
        id: crypto.randomUUID(),
        senderId: import.meta.env.VITE_DEFAULT_SYSTEM_ID,
        convoId: message.convoId,
        createdAt: new Date().toISOString(),
        content: response.output_text,
        previousResponseId: response.id,
      };

      // Store bot's response in IndexedDB
      await db.messages.add(botResponse);

      // Check if this is a summary message and extract symptoms/severity if needed
      const summaryDetails = this.extractSummaryDetails(response.output_text);
      if (summaryDetails) {
        // Update conversation with summary details
        await db.conversations.update(message.convoId, {
          symptoms: summaryDetails.symptoms.join(", "),
        });
      }

      this.notifyListeners("message_sent", botResponse);
    } catch (error) {
      console.error("Error sending message to OpenAI:", error);
      this.notifyListeners("error", error);
    }
  }

  // Join a conversation (now just sets the current conversation ID)
  joinConvo(convoId: string): void {
    this.currentConvo = convoId;
    console.log(`Joined conversation: ${convoId}`);
  }

  // Leave a conversation
  leaveConvo(convoId: string): void {
    if (this.currentConvo === convoId) {
      this.currentConvo = null;
    }
    console.log(`Left conversation: ${convoId}`);
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

  // Simulate disconnect
  disconnect(): void {
    this.notifyListeners("disconnect", null);
    console.log("Disconnected from local message service");
  }

  // Send a message (now directly processes it without WebSocket)
  sendMessage(message: Message) {
    // Validate the message
    const parsedMessage = MessageSchema.safeParse(message);
    if (!parsedMessage.success) {
      console.error("Invalid message format:", parsedMessage.error);
      this.notifyListeners("error", "Invalid message format");
      return;
    }

    // Store in IndexedDB
    db.messages
      .add(message)
      .then(() => {
        this.notifyListeners("message_sent", message);
      })
      .catch((error) => {
        console.error("Error storing message:", error);
        this.notifyListeners("error", error);
      });
  }

  extractSymptomsFromText(text: string): string[] {
    return symptomsKeywords.filter((symptom) =>
      text.toLowerCase().includes(symptom.toLowerCase())
    );
  }

  isMessageTheChatSummary(message: string) {
    const isSummary = /summary of our conversation:/i.test(
      message.toLowerCase()
    );
    return isSummary;
  }

  extractSummaryDetails(message: string) {
    const isSummary = this.isMessageTheChatSummary(message);
    if (!isSummary) {
      return null;
    }

    const severityMatch = message.match(/\*{2}Severity Level:\*{2}\s*(.+)/i);
    const severity = severityMatch ? severityMatch[1].trim() : "";

    const symptomsMatch = message.match(
      /\*\*Symptoms:\*\*\s*((?:.|\n)*?)(?=\n- \*\*|\n\n|\*\*)/i
    );
    let symptomsText = symptomsMatch ? symptomsMatch[1].trim() : "";
    symptomsText = symptomsText.replace(/^[-•]\s*/gm, "");

    const symptoms = symptomsText
      .split(/\n|,/) // either newline or comma-separated
      .map((s) => s.trim().replace(/^[-•]\s*/gm, ""))
      .filter((s) => s.length > 0);

    return {
      severity,
      symptoms,
    };
  }
}

// Export a singleton instance of the MessageService
const messageService = new MessageService();
export default messageService;
