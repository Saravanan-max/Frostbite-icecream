import http from "http";
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

  const server = http.createServer(async (req, res) => {
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host || "localhost";
    const url = `${protocol}://${host}${req.url}`;

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length ? Buffer.concat(chunks) : undefined;

    const request = new Request(url, {
      method: req.method,
      headers: Object.fromEntries(
        Object.entries(req.headers).filter(([, v]) => v !== undefined)
      ),
      body: body && body.length > 0 ? body : undefined,
    });

    try {
      const response = await handler.fetch(request, {}, {});
      res.statusCode = response.status;
      response.headers.forEach((value, key) => res.setHeader(key, value));
      const buffer = await response.arrayBuffer();
      res.end(Buffer.from(buffer));
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
