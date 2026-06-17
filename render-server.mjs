import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { pathToFileURL } from "url";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

async function loadServer() {
  const serverJs = path.join(__dirname, "dist", "server", "server.js");
  const mod = await import(pathToFileURL(serverJs).href);
  console.log("server.js keys:", Object.keys(mod));

  // dist/server/server.js re-exports the TanStack Start handler
  // Try every known export shape
  const candidate =
    mod.default?.fetch ? mod.default :
    mod.fetch ? mod :
    mod.default?.default?.fetch ? mod.default.default :
    mod.handler?.fetch ? mod.handler :
    null;

  if (candidate) return candidate;

  // Last resort: find any key that has a .fetch function
  for (const key of Object.keys(mod)) {
    if (mod[key] && typeof mod[key].fetch === "function") return mod[key];
    if (mod[key]?.default && typeof mod[key].default.fetch === "function") return mod[key].default;
  }

  throw new Error("No fetch handler found. Keys: " + Object.keys(mod).join(", "));
}

async function main() {
  const handler = await loadServer();
  console.log("Handler loaded, fetch type:", typeof handler.fetch);

  const app = new Hono();

  // Serve static files from dist/client
  app.use("/assets/*", serveStatic({ root: "./dist/client" }));
  app.use("/favicon.ico", serveStatic({ root: "./dist/client" }));
  app.use("/robots.txt", serveStatic({ root: "./dist/client" }));

  // All other requests → TanStack Start SSR
  app.all("*", (c) => handler.fetch(c.req.raw, {}, {}));

  serve({ fetch: app.fetch, port: Number(PORT) }, () => {
    console.log(`🍦 Frost Bite running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
