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
  const assetsDir = path.join(__dirname, "dist", "server", "assets");
  const files = fs.readdirSync(assetsDir);
  const serverFile = files.find((f) => f.startsWith("server-") && f.endsWith(".js"));
  if (!serverFile) throw new Error("Server bundle not found in dist/server/assets/");
  const mod = await import(pathToFileURL(path.join(assetsDir, serverFile)).href);
  return mod.default ?? mod;
}

async function main() {
  const handler = await loadServer();
  const app = new Hono();

  // Serve static assets from dist/client
  app.use(
    "/assets/*",
    serveStatic({
      root: "./dist/client",
    })
  );

  app.use(
    "/favicon.ico",
    serveStatic({ root: "./dist/client" })
  );

  // All other requests go to TanStack Start SSR handler
  app.all("*", async (c) => {
    const response = await handler.fetch(c.req.raw, {}, {});
    return response;
  });

  serve({ fetch: app.fetch, port: Number(PORT) }, () => {
    console.log(`🍦 Frost Bite running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
