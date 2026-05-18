import Fastify from "fastify";
import { env } from "./env.js";
import { healthRoutes } from "./routes/health.js";

export function buildServer() {
  const app = Fastify({
    logger: { level: env.NODE_ENV === "production" ? "info" : "debug" },
  });

  app.register(healthRoutes);

  return app;
}
