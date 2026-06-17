import http from "http";
import { pathToFileURL } from "url";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const clientDir = path.join(__dirname, "dist", "client");

const MIME = {
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
};

function serveStatic(req, res) {
  const urlPath = req.url.split("?")[0];
  const filePath = path.join(clientDir, urlPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const mime = MIME[ext] || "application/octet-stream";
    const isImmutable = urlPath.startsWith("/assets/");
    res.setHeader("Content-Type", mime);
    if (isImmutable) res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.statusCode = 200;
    fs.createReadStream(filePath).pipe(res);
    return true;
  }
  return false;
}

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
    // Serve static assets directly
    if (serveStatic(req, res)) return;

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
      console.error("SSR Error:", err);
      // Fallback: serve index.html for client-side routing
      const indexPath = path.join(clientDir, "index.html");
      if (fs.existsSync(indexPath)) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        fs.createReadStream(indexPath).pipe(res);
      } else {
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    }
  });

  server.listen(PORT, () => {
    console.log(`🍦 Frost Bite server running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
