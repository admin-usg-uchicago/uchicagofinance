import { buildServer } from "./server.js";
import { env } from "./env.js";
import { db } from "./db.js";

async function main() {
  const app = buildServer();

  app.addHook("onClose", async () => {
    await db.$disconnect();
  });

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
