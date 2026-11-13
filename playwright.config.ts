import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
const baseURL = process.env.NETVERSE_BASE_URL ?? "http://127.0.0.1:5173";
const browser =
  process.env.NETVERSE_BROWSER ??
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ].find(existsSync);
export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  workers: 1,
  use: {
    baseURL,
    viewport: { width: 1440, height: 1000 },
    launchOptions: {
      executablePath: browser,
      args: ["--enable-unsafe-swiftshader"],
    },
    screenshot: "only-on-failure",
  },
  reporter: [["list"], ["html", { open: "never" }]],
  webServer: {
    command: process.env.NETVERSE_BASE_URL
      ? "node scripts/serve.mjs --no-open"
      : "npm run dev -- --port 5173",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
