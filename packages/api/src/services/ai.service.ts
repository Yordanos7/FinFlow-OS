import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { Groq } from "groq-sdk";

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
  private geminiModel: GenerativeModel | null = null;
  private groqClient: Groq | null = null;
  private geminiKey: string | undefined;
  private groqKey: string | undefined;

  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.groqKey = process.env.GROQ_API_KEY;
    this.initialize();
  }

  private initialize() {
    if (this.geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(this.geminiKey);
        this.geminiModel = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          systemInstruction: SYSTEM_INSTRUCTION,
        });
      } catch (e) {
        console.error("Failed to initialize Gemini model:", e);
      }
    }

    if (this.groqKey) {
      try {
        this.groqClient = new Groq({ apiKey: this.groqKey });
      } catch (e) {
        console.error("Failed to initialize Groq client:", e);
      }
    }
  }

  private getModel(taskType: 'chat' | 'analysis') {
    if (taskType === 'analysis' && this.geminiModel) {
      return { type: 'gemini', model: this.geminiModel };
    }
    
    if (this.groqClient) {
      return { type: 'groq', client: this.groqClient };
    }

    if (this.geminiModel) {
      return { type: 'gemini', model: this.geminiModel };
    }

    throw new Error("AI Services not initialized. Please provide GEMINI_API_KEY or GROQ_API_KEY.");
  }

  async generateResponse(message: string, context?: any) {
    try {
      const modelInfo = this.getModel(context?.data ? 'analysis' : 'chat');

      if (modelInfo.type === 'groq') {
        const completion = await modelInfo.client!.chat.completions.create({
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTION },
            ...(context?.history || []),
            { 
              role: "user", 
              content: context?.data 
                ? `Context Data: ${JSON.stringify(context.data)}\n\nUser Query: ${message}` 
                : message 
            },
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
        });
        return completion.choices[0]?.message?.content || "No response generated";
      } else {
        const chat = modelInfo.model!.startChat({
          history: context?.history || [],
        });

        const prompt = context?.data 
          ? `Context Data: ${JSON.stringify(context.data)}\n\nUser Query: ${message}`
          : message;

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        return response.text();
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw new Error("Failed to generate AI response. Check your API keys.");
    }
  }

  async analyzeData(data: any, query: string) {
    // For large data sets, always use Gemini 1.5 Flash
    if (!this.geminiModel) {
      // Fallback to Groq if Gemini is missing, but with a warning or truncation
      return this.generateResponse(query, { data });
    }

    const prompt = `
      Data to Analyze: ${JSON.stringify(data)}
      
      Analysis Request: ${query}
      
      Please provide a detailed analysis based ONLY on the provided data.
      Use a structured JSON format if the request implies data updates.
    `;

    const result = await this.geminiModel.generateContent(prompt);
    return result.response.text();
  }
}

export const aiService = new AIService();
