import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import prisma from "@ffo/db";
import { auth } from "@ffo/auth";
import { fromNodeHeaders } from "better-auth/node";

export async function createContext(opts: CreateExpressContextOptions) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(opts.req.headers),
  });
  return {
    session,
    prisma,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
