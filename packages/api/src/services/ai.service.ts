import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `
You are FinFlowOs AI, an intelligent financial assistant for Ethiopian companies.
Your goal is to help businesses automate reports, analyze finances, and improve efficiency.

Key Responsibilities:
1. Analyze financial data (budgets, expenses, transactions)
2. Generate professional reports
3. Provide actionable business insights
4. Answer questions in English or Amharic

Tone: Professional, helpful, and data-driven.
When analyzing data, be specific and cite numbers.
`;

export class AIService {
  private model: GenerativeModel | null = null;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey) {
      this.initializeModel();
    }
  }

  private initializeModel() {
    if (!this.apiKey) return;
    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        systemInstruction: SYSTEM_INSTRUCTION,
      });
    } catch (e) {
      console.error("Failed to initialize Gemini model:", e);
    }
  }

  private ensureInitialized() {
    if (!this.model) {
      // Try initializing again in case env var was loaded late
      this.apiKey = process.env.GEMINI_API_KEY;
      if (this.apiKey) {
        this.initializeModel();
      }
      
      if (!this.model) {
        throw new Error("GEMINI_API_KEY is missing. Please add it to your .env file.");
      }
    }
    return this.model!;
  }

  async generateResponse(message: string, context?: any) {
    try {
      const model = this.ensureInitialized();
      const chat = model.startChat({
        history: context?.history || [],
      });

      const prompt = context?.data 
        ? `Context Data: ${JSON.stringify(context.data)}\n\nUser Query: ${message}`
        : message;

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw new Error("Failed to generate AI response");
    }
  }

  async analyzeData(data: any, query: string) {
    const model = this.ensureInitialized();
    const prompt = `
      Data to Analyze: ${JSON.stringify(data)}
      
      Analysis Request: ${query}
      
      Please provide a detailed analysis based ONLY on the provided data.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}

export const aiService = new AIService();
