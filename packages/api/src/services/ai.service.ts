import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      systemInstruction: SYSTEM_INSTRUCTION,
    });
  }

  async generateResponse(message: string, context?: any) {
    try {
      const chat = this.model.startChat({
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
    const prompt = `
      Data to Analyze: ${JSON.stringify(data)}
      
      Analysis Request: ${query}
      
      Please provide a detailed analysis based ONLY on the provided data.
    `;

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }
}

export const aiService = new AIService();
