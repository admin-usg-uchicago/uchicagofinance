import type { FastifyInstance } from "fastify";
import { db } from "../db.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/healthz", async () => {
    let dbOk = false;
    try {
      await db.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {
      dbOk = false;
    }
    return { status: "ok", db: dbOk ? "ok" : "unreachable" };
  });
}
