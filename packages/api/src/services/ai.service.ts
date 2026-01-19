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
    console.log("[AIService] Initializing. Gemini Key present:", !!this.geminiKey, "Groq Key present:", !!this.groqKey);
    this.initialize();
  }

  private initialize() {
    if (this.geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(this.geminiKey);
        this.geminiModel = genAI.getGenerativeModel({ 
          model: "gemini-flash-latest", 
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

  private async withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (retries > 0 && (error.status === 503 || error.status === 429)) {
        console.warn(`[AIService] AI overloaded (Status ${error.status}). Retrying in ${delay}ms... (${retries} left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  async generateResponse(message: string, context?: any): Promise<string> {
    try {
      const modelInfo = this.getModel(context?.data ? 'analysis' : 'chat');

      return await this.withRetry(async () => {
        if (modelInfo.type === 'groq') {
          const completion = await modelInfo.client!.chat.completions.create({
            messages: [
              { role: "system", content: SYSTEM_INSTRUCTION },
              ...(context?.history || []),
              { 
                role: "user", 
                content: context?.data 
                  ? `${SYSTEM_INSTRUCTION}\n\nContext Data: ${JSON.stringify(context.data)}\n\nUser Query: ${message}` 
                  : `${SYSTEM_INSTRUCTION}\n\nUser Query: ${message}` 
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
            ? `${SYSTEM_INSTRUCTION}\n\nContext Data: ${JSON.stringify(context.data)}\n\nUser Query: ${message}`
            : `${SYSTEM_INSTRUCTION}\n\nUser Query: ${message}`;

          const result = await chat.sendMessage(prompt);
          const response = await result.response;
          const text = response.text();
          return text;
        }
      });
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      
      // Critical Fallback: If primary model fails after retries, try Groq immediately
      if (this.groqClient && context?.taskType !== 'fallback') {
        console.log("[AIService] Primary model failed. Falling back to Groq Llama 3...");
        return this.generateResponse(message, { ...context, taskType: 'fallback' });
      }

      throw new Error(`AI System busy: ${error.message || "Please try again later."}`);
    }
  }

  async analyzeData(data: any, query: string) {
    console.log("[AIService] analyzeData called for query:", query.slice(0, 50) + "...");
    
    try {
      if (this.geminiModel) {
        return await this.withRetry(async () => {
          const prompt = `
            ${SYSTEM_INSTRUCTION}
            
            Data to Analyze: ${JSON.stringify(data)}
            
            Analysis Request: ${query}
            
            Please provide a detailed analysis based ONLY on the provided data.
            Use a structured JSON format if the request implies data updates.
          `;

          const result = await this.geminiModel!.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          console.log("[AIService] Gemini analyzeData success. Response length:", text.length);
          return text;
        });
      }
      throw new Error("Gemini not available");
    } catch (error: any) {
      console.warn("[AIService] Gemini Analysis failed. Falling back to Groq...", error.message);
      
      if (this.groqClient) {
        return this.generateResponse(query, { data, taskType: 'fallback' });
      }
      
      throw error;
    }
  }
}

export const aiService = new AIService();
