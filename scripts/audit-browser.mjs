// Reproduce the 30-minute renderer soak against a frozen production build.
// NETVERSE_BASE_URL and NETVERSE_BROWSER may override the local defaults.
import { chromium } from "playwright";
import fs from "node:fs";
import { createHash } from "node:crypto";
const buildHash = createHash("sha256")
  .update(fs.readFileSync("dist/index.html"))
  .digest("hex");
(async () => {
  const b = await chromium.launch({
    executablePath:
      process.env.NETVERSE_BROWSER ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--enable-unsafe-swiftshader"],
  });
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(process.env.NETVERSE_BASE_URL || "http://127.0.0.1:4173");
  await p.getByRole("button", { name: "Mundo 3D", exact: true }).click();
  await p.locator(".world-lab canvas").waitFor();
  await p.getByRole("button", { name: "P / Métricas 3D", exact: true }).click();
  const cdp = await p.context().newCDPSession(p);
  await cdp.send("Performance.enable");
  const nav = p.getByRole("navigation", { name: "Áreas do simulador" });
  const start = Date.now();
  const samples = [];
  const duration = 30 * 60 * 1000;
  fs.writeFileSync(
    "docs/audit/stability-30min.json",
    JSON.stringify({ complete: false, buildHash, samples, errors }, null, 2),
  );
  while (Date.now() - start < duration) {
    const i = samples.length % 12;
    await nav.getByRole("button").nth(i).click();
    const run = p.getByRole("button", {
      name: "Executar experiência",
      exact: true,
    });
    if (await run.isVisible()) await run.click();
    const expectedWait = Math.max(
      0,
      Math.min(55000, duration - (Date.now() - start)),
    );
    const waitingSince = Date.now();
    await p.waitForTimeout(expectedWait);
    if (Date.now() - waitingSince > expectedWait + 10000)
      throw Error(
        "Teste interrompido por suspensão ou atraso prolongado; não certifica 30 minutos contínuos.",
      );
    const metrics = await cdp.send("Performance.getMetrics");
    const read = (n) => metrics.metrics.find((m) => m.name === n)?.value;
    const renderer = await p.locator(".world-profiler").innerText();
    samples.push({
      elapsedSeconds: Math.round((Date.now() - start) / 1000),
      zone: i,
      heapUsedMB: read("JSHeapUsedSize") / 1024 / 1024,
      domNodes: read("Nodes"),
      attachedDomNodes: await p.locator("*").count(),
      documents: read("Documents"),
      renderer,
    });
    fs.writeFileSync(
      "docs/audit/stability-30min.json",
      JSON.stringify(
        {
          complete: false,
          buildHash,
          environment:
            "Chrome headless local; sem benchmark de GPU física; pode haver QA concorrente nas amostras iniciais",
          samples,
          errors,
        },
        null,
        2,
      ),
    );
    console.log(JSON.stringify(samples.at(-1)));
  }
  if (
    createHash("sha256")
      .update(fs.readFileSync("dist/index.html"))
      .digest("hex") !== buildHash
  )
    throw Error("O build mudou durante o teste.");
  fs.writeFileSync(
    "docs/audit/stability-30min.json",
    JSON.stringify(
      {
        complete: true,
        buildHash,
        durationSeconds: Math.round((Date.now() - start) / 1000),
        environment:
          "Chrome headless local; GPU física e memória GPU não certificadas; QA concorrente nas amostras iniciais",
        samples,
        errors,
      },
      null,
      2,
    ),
  );
  await b.close();
})().catch((e) => {
  console.log(e.stack);
  process.exit(1);
});
