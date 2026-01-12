import { protectedProcedure, publicProcedure, router } from "../index";
import { aiRouter } from "./ai";
import { companyRouter } from "./company";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  ai: aiRouter,
  company: companyRouter,
});
export type AppRouter = typeof appRouter;
