import { z } from "zod";
import { router, protectedProcedure } from "../index";

export const companyRouter = router({
  // Get current company details
  get: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.company.findUniqueOrThrow({
        where: { slug: input.slug },
        include: {
          departments: true,
          members: {
            where: { userId: ctx.session.user.id }
          }
        }
      });
    }),

  // Get company by ID (useful for internal lookups)
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify membership
      const membership = await ctx.prisma.companyMember.findUnique({
        where: {
          userId_companyId: {
            userId: ctx.session.user.id,
            companyId: input.id
          }
        }
      });

      if (!membership) {
        throw new Error("Unauthorized Access to Company");
      }

      return ctx.prisma.company.findUniqueOrThrow({
        where: { id: input.id }
      });
    }),

  // Update company settings
  updateSettings: protectedProcedure
    .input(z.object({
      id: z.string(),
      settings: z.any() // In prod, use stricter schema
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify admin
      const membership = await ctx.prisma.companyMember.findUnique({
        where: {
          userId_companyId: {
            userId: ctx.session.user.id,
            companyId: input.id
          }
        }
      });

      if (!membership || membership.role !== "super_admin") {
        throw new Error("Only admins can update settings");
      }

      return ctx.prisma.company.update({
        where: { id: input.id },
        data: { settings: input.settings }
      });
    })
});
