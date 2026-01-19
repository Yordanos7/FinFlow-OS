import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { aiService } from "../services/ai.service";

export const aiRouter = router({
  sendMessage: protectedProcedure
    .input(z.object({
      message: z.string(),
      conversationId: z.string().optional(),
      companyId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      
      // 1. Get or create conversation
      let conversationId = input.conversationId;
      if (!conversationId) {
        const conversation = await prisma.aIConversation.create({
          data: {
            userId: session.user.id,
            companyId: input.companyId,
            title: input.message.slice(0, 50) + "...",
            messages: []
          }
        });
        conversationId = conversation.id;
      }

      // 2. Fetch relevant company context (Basic RAG)
      // For now, we fetch project summaries and department budgets
      const [departments, projects] = await Promise.all([
        prisma.department.findMany({
          where: { companyId: input.companyId },
          select: { name: true, budget: true }
        }),
        prisma.project.findMany({
          where: { companyId: input.companyId, status: 'active' },
          select: { name: true, budget: true, status: true }
        })
      ]);

      const contextData = {
        departments,
        activeProjects: projects
      };

      // 3. Generate AI Response
      const aiResponse = await aiService.generateResponse(input.message, {
        data: contextData
      });

      // 4. Save messages to DB
      const timestamp = new Date().toISOString();
      const newMessages = [
        { role: 'user', content: input.message, timestamp },
        { role: 'assistant', content: aiResponse, timestamp }
      ];

      // Update conversation with new messages
      // Note: In production, we'd append to the JSON array efficiently
      // For now, we'll fetch, append, and update (simplified)
      const currentConversation = await prisma.aIConversation.findUniqueOrThrow({
        where: { id: conversationId }
      });

      const currentMessages = (currentConversation.messages as any[]) || [];
      const updatedMessages = [...currentMessages, ...newMessages];

      await prisma.aIConversation.update({
        where: { id: conversationId },
        data: {
          messages: updatedMessages,
          updatedAt: new Date()
        }
      });

      return {
        id: conversationId,
        message: aiResponse,
        history: updatedMessages
      };
    }),

  runComplexTask: protectedProcedure
    .input(z.object({
      message: z.string(),
      data: z.any(),
      companyId: z.string(),
    }))
    .mutation(async ({ input }) => {
      console.log("[AIRouter] runComplexTask starting for company:", input.companyId);
      try {
        const prompt = `
          You are an expert financial data processor. 
          Your task is to analyze the following spreadsheet data and fulfill the user request.
          
          USER REQUEST: ${input.message}
          
          DATA: ${JSON.stringify(input.data)}
          
          You must return a JSON object with the following structure:
          {
            "analysis": "A brief text summary of what you found/did",
            "updates": [
              { "row": number, "col": number, "value": string, "formula": string }
            ]
          }
          
          If the request is for an analysis only, "updates" can be an empty array.
          If the request is to "total expenses", provide the value in a logical new cell and return it in "updates".
          Be precise with row/col indices (0-indexed).
        `;

        const aiResponseText = await aiService.analyzeData(input.data, prompt);
        
        try {
          // Attempt to extract JSON if the AI wrapped it in markdown or text
          const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
          const result = JSON.parse(jsonMatch ? jsonMatch[0] : aiResponseText);
          return result;
        } catch (e) {
          console.warn("[AIRouter] Failed to parse AI response as JSON:", aiResponseText);
          return {
            analysis: aiResponseText,
            updates: []
          };
        }
      } catch (error: any) {
        console.error("[AIRouter] Error in runComplexTask:", error);
        throw error;
      }
    }),

  getConversations: protectedProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.aIConversation.findMany({
        where: { 
          companyId: input.companyId,
          userId: ctx.session.user.id 
        },
        orderBy: { updatedAt: 'desc' },
        take: 10
      });
    }),
});
