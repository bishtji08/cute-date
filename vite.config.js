import { appendFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const projectDirectory = dirname(fileURLToPath(import.meta.url));
const responseLogPath = resolve(projectDirectory, "logs", "responses.log");
const acceptedEvents = new Set(["opened", "no_attempt", "yes"]);
const eventLabels = {
  opened: "Opened invitation",
  no_attempt: "Tried to choose No",
  yes: "Responded YES",
};

function responseLogger() {
  return {
    name: "response-logger",
    configureServer(server) {
      server.middlewares.use("/api/log-response", (request, response, next) => {
        if (request.method !== "POST") {
          next();
          return;
        }

        const chunks = [];
        let bodyLength = 0;
        let tooLarge = false;

        request.on("data", (chunk) => {
          bodyLength += chunk.length;
          if (bodyLength > 8192) {
            tooLarge = true;
            response.statusCode = 413;
            response.end();
            return;
          }
          chunks.push(chunk);
        });

        request.on("end", async () => {
          if (tooLarge) return;

          let payload;
          try {
            payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          } catch {
            response.statusCode = 400;
            response.end("Invalid response event");
            return;
          }

          const { event } = payload;
          if (!acceptedEvents.has(event)) {
            response.statusCode = 400;
            response.end("Unknown response event");
            return;
          }

          const entry = { timestamp: new Date().toISOString(), event };
          if (event === "yes") {
            if (typeof payload.message !== "string" || !payload.message.trim() || payload.message.length > 500) {
              response.statusCode = 400;
              response.end("A message of up to 500 characters is required");
              return;
            }
            entry.message = payload.message.trim();
          }

          try {
            await mkdir(dirname(responseLogPath), { recursive: true });
            await appendFile(responseLogPath, `${JSON.stringify(entry)}\n`, "utf8");
            server.config.logger.info(
              `[response] ${JSON.stringify(entry)}`,
              { timestamp: false },
            );
            response.statusCode = 204;
            response.end();
          } catch (error) {
            server.config.logger.error(`[response] Could not save log: ${error.message}`);
            response.statusCode = 500;
            response.end("Could not save response");
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), responseLogger()],
});