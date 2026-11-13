import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

// Only serves the compiled local app. No application backend or external calls.
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../dist",
);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};
try {
  await stat(path.join(root, "index.html"));
} catch {
  console.error(
    "Build nao encontrado. Execute npm install e npm run build primeiro.",
  );
  process.exit(1);
}
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://localhost");
    const pathname = decodeURIComponent(url.pathname);
    let file = path.resolve(root, "." + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403);
      res.end("Acesso negado");
      return;
    }
    if (pathname.endsWith("/")) file = path.join(file, "index.html");
    const data = await readFile(file);
    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] ?? "application/octet-stream",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Arquivo nao encontrado. Abra a pagina inicial.");
  }
});
let port = Number(process.env.PORT ?? 4173);
server.on("error", (error) => {
  if (error.code === "EADDRINUSE" && port < 4183) {
    server.listen(++port, "127.0.0.1");
  } else {
    console.error(error.message);
    process.exitCode = 1;
  }
});
server.listen(port, "127.0.0.1", () => {
  const url = `http://127.0.0.1:${port}`;
  console.log(
    `\nNETVERSE - O universo vivo das redes\n\nAbra ${url}\nServidor apenas neste computador. Ctrl+C para encerrar.\n`,
  );
  if (!process.argv.includes("--no-open")) {
    const command =
      process.platform === "win32"
        ? "cmd.exe"
        : process.platform === "darwin"
          ? "open"
          : "xdg-open";
    const args =
      process.platform === "win32" ? ["/c", "start", "", url] : [url];
    const child = spawn(command, args, { stdio: "ignore", windowsHide: true });
    child.on("error", () => console.log(`Abra manualmente: ${url}`));
    child.unref();
  }
});
