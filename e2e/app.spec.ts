import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
test("12 áreas, controles, inspeção, terminal e quiz", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /O universo vivo/ }),
  ).toBeVisible();
  const nav = page.getByRole("navigation", { name: "Áreas do simulador" });
  await expect(nav.getByRole("button")).toHaveCount(12);
  for (const name of [
    "Camadas OSI",
    "TCP × UDP",
    "Viagem da web",
    "Switch e roteador",
    "Topologias",
    "Meios físicos",
    "Diagnóstico",
    "Segurança",
    "Desempenho",
    "Tendências",
  ]) {
    await nav.getByRole("button", { name: new RegExp(name) }).click();
    await expect(
      page.getByRole("button", { name: "Próximo passo", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Próximo passo", exact: true })
      .click();
    await page.getByRole("button", { name: "Reiniciar", exact: true }).click();
  }
  await nav.getByRole("button", { name: /Diagnóstico/ }).click();
  await page.getByLabel("Comando do terminal").fill("ipconfig");
  await page.getByRole("button", { name: "Executar comando" }).click();
  await expect(page.locator(".terminal pre")).toContainText("192.168.10.2");
  await nav.getByRole("button", { name: /Glossário e quiz/ }).click();
  await page.getByRole("button", { name: "A Switch", exact: true }).click();
  await expect(page.getByText("Conexão estabelecida!")).toBeVisible();
  await page.getByLabel("Buscar no glossário").fill("DNS");
  await expect(page.locator(".glossary summary")).toHaveCount(1);
  await page.screenshot({
    path: "docs/screenshots/quiz-desktop.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("laboratório salva, valida e recupera uma topologia", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Laboratório livre LAB" }).click();
  await page.getByRole("button", { name: "Adicionar", exact: true }).click();
  await page.getByRole("button", { name: "Fechar inspeção" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Salvar JSON" }).click();
  const download = await downloadPromise;
  const file = await download.path();
  const data = JSON.parse(await readFile(file!, "utf8"));
  expect(data.devices).toHaveLength(7);
  await page.getByRole("button", { name: "Reiniciar", exact: true }).click();
  await page.getByLabel("Carregar topologia JSON").setInputFiles({
    name: "topologia.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(data)),
  });
  await expect(
    page.getByLabel("Conectar origem").locator("option"),
  ).toHaveCount(7);
  await page.getByLabel("Carregar topologia JSON").setInputFiles({
    name: "invalido.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":1,"devices":[],"links":[]}'),
  });
  await expect(page.locator(".error-message")).toContainText("IDs únicos");
  await expect(
    page.getByLabel("Conectar origem").locator("option"),
  ).toHaveCount(7);
});
test("quiz percorre 24 questões, mostra pontuação e reinicia", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /Glossário e quiz/ })
    .click();
  for (let i = 0; i < 24; i++) {
    await page.locator(".quiz-options button").first().click();
    await expect(page.locator(".quiz-feedback")).toBeVisible();
    await page
      .getByRole("button", {
        name: i === 23 ? "Ver resultado" : "Próxima questão",
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "8 conexões corretas." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Recomeçar quiz" }).click();
  await expect(page.locator(".quiz-score")).toHaveText(
    "0 acertos · 0 respondidas",
  );
});
test("tamanhos notebook, tablet e celular preservam a largura", async ({
  page,
}) => {
  for (const width of [320, 768, 1024, 1366, 1920]) {
    await page.setViewportSize({ width, height: 768 });
    await page.goto("/");
    await expect(page.locator(".cinematic-stage")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `largura ${width}`,
    ).toBe(true);
    if (width === 1366)
      await page.screenshot({
        path: "docs/screenshots/notebook.png",
        fullPage: true,
      });
  }
});
test("WebGL indisponível oferece mapa funcional", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes("webgl")) return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /Camadas OSI/ })
    .click();
  await expect(
    page.getByRole("img", { name: "Mapa 2D interativo da rede" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Inspecionar SEU COMPUTADOR" })
    .click();
  await expect(
    page.getByRole("complementary", { name: "Inspeção", exact: true }),
  ).toContainText("192.168.10.2");
});
test("página web completa com perda, inspeção e pausa", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /Viagem da web/ })
    .click();
  await page.getByRole("button", { name: /Perder fragmento HTTP/ }).click();
  await page.getByLabel("Velocidade", { exact: true }).selectOption("4");
  await page.getByRole("button", { name: "Acessar página" }).click();
  await expect(
    page.getByRole("heading", { name: "Olá, universo!" }),
  ).toBeVisible({ timeout: 40000 });
  await expect(page.locator(".metric-strip")).toContainText("RETRANSMISSÕES");
  await expect(
    page
      .locator(".metric-strip > div")
      .filter({ hasText: "RETRANSMISSÕES" })
      .locator("strong"),
  ).toHaveText("1");
  await page
    .locator(".log-line")
    .filter({ hasText: "HTTP 200" })
    .first()
    .click();
  await expect(
    page.getByRole("complementary", { name: "Inspeção", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("complementary", { name: "Inspeção", exact: true }),
  ).toContainText("IP origem");
  await page.getByRole("button", { name: "Fechar inspeção" }).click();
  await page.evaluate(() => {
    (document.activeElement as HTMLElement | null)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({
    path: "docs/screenshots/web-desktop.png",
    fullPage: true,
  });
});
test("mobile sem overflow, navegação e modo apresentação", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /O universo vivo/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".cinematic-stage")).toBeVisible();
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: "docs/screenshots/home-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Abrir navegação" }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /Segurança/ })
    .click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "docs/screenshots/security-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Abrir navegação" }).click();
  await page.getByRole("button", { name: "Modo apresentação" }).click();
  await expect(page.locator(".presentation-bar")).toBeVisible();
  await page.getByRole("button", { name: "Próximo cenário" }).click();
  await expect(
    page.getByRole("heading", { name: "Camadas OSI / TCP-IP" }),
  ).toBeVisible();
});
test("recursos locais, mapa 2D e screenshot inicial", async ({ page }) => {
  const external: string[] = [];
  await page.route("**/*", (route) => {
    if (
      !route.request().url().startsWith("http://127.0.0.1:") &&
      !route.request().url().startsWith("data:")
    ) {
      external.push(route.request().url());
      return route.abort();
    }
    return route.continue();
  });
  await page.goto("/");
  await expect(page.locator(".cinematic-stage")).toBeVisible();
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: "docs/screenshots/home-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /Camadas OSI/ })
    .click();
  await page.getByRole("button", { name: "Alternar mapa 2D" }).click();
  await expect(
    page.getByRole("img", { name: "Mapa 2D interativo da rede" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Inspecionar SEU COMPUTADOR" })
    .click();
  await expect(
    page.getByRole("complementary", { name: "Inspeção", exact: true }),
  ).toContainText("192.168.10.2");
  expect(external).toEqual([]);
});
test("missões verificam resultado, oferecem dicas e preservam pontuação", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Desafios de rede 6" }).click();
  await expect(
    page.getByRole("dialog", { name: "Escolher desafio" }),
  ).toBeVisible();
  await page
    .getByRole("button")
    .filter({ hasText: "A primeira conexão" })
    .click();
  await expect(page.getByLabel("Missão ativa")).toContainText(
    "MISSÃO EM ANDAMENTO",
  );
  await page.getByRole("button", { name: "Dica 0/3" }).click();
  await expect(
    page.getByText("Dica 1: Confira origem e destino no painel."),
  ).toBeVisible();
  await page.getByLabel("Velocidade", { exact: true }).selectOption("4");
  await page.getByRole("button", { name: "Iniciar", exact: true }).click();
  await expect(page.getByLabel("Missão ativa")).toContainText(
    "MISSÃO VERIFICADA",
    { timeout: 15000 },
  );
  await page.getByRole("button", { name: "Desafios de rede 6" }).click();
  await expect(page.locator(".mission-total")).toHaveText(
    "1/6 concluídos · 100 pontos verificados",
  );
});

test("OSI tem origem e destino, inspeção independente e acompanhamento do motor", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /Camadas OSI/ })
    .click();
  await expect(page.locator(".osi-slab")).toHaveCount(14);
  await page
    .getByRole("button", { name: "Origem: camada 3 Rede", exact: true })
    .click();
  await expect(page.locator(".osi-detail-title h3")).toHaveText("Rede");
  await page.getByRole("button", { name: "Seguir mensagem" }).click();
  await page
    .getByRole("button", { name: "Próximo passo", exact: true })
    .click();
  await expect(page.locator(".osi-slab.is-active")).toHaveCount(1);
  await expect(page.locator(".osi-inspector-top")).toContainText(
    "ACOMPANHANDO",
  );
  await page.screenshot({
    path: "docs/screenshots/osi-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "docs/screenshots/osi-mobile.png",
    fullPage: true,
  });
});

test("jornadas e busca ajudam a descobrir áreas por teclado", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("tab", { name: /Construir conexões/ }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Topologias");
  await page
    .getByRole("tab", { name: /Construir conexões/ })
    .press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: /Resolver um mistério/ }),
  ).toHaveAttribute("aria-selected", "true");
  await page
    .getByRole("button", { name: "Buscar experiência", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Pesquisar áreas" })
    .fill("seguranca");
  await page.getByRole("textbox", { name: "Pesquisar áreas" }).press("Enter");
  await expect(
    page.getByRole("heading", { name: "Segurança e firewall", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("dialog", { name: "Buscar experiência" }),
  ).not.toBeVisible();
});

test("laboratório imersivo permite exploração, inspeção e saída segura", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: /Entrar no laboratório/ }).click();
  const lab = page.getByRole("dialog", { name: "Laboratório imersivo" });
  await expect(lab).toBeVisible();
  await expect(lab.locator("canvas")).toBeVisible();
  for (let i = 0; i < 3; i++)
    await lab.locator(".immersive-device-list button").nth(i).click();
  await expect(lab.locator(".immersive-mission")).toContainText("3/3");
  await expect(
    lab.getByRole("complementary", { name: "Equipamento selecionado" }),
  ).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/immersive-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await lab.evaluate((e) => e.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "docs/screenshots/immersive-mobile.png" });
  await page.keyboard.press("Escape");
  await expect(lab).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: /O universo vivo/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("previsão OSI dá feedback e conecta a resposta à camada", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /Camadas OSI/ })
    .click();
  const quiz = page.getByRole("region", { name: "Teste sua intuição" });
  await quiz.getByRole("button", { name: "B Rede" }).click();
  await expect(quiz.getByRole("status")).toContainText("Isso!");
  await quiz.getByRole("button", { name: "Mostrar na pilha" }).click();
  await expect(page.locator(".osi-detail-title h3")).toHaveText("Rede");
  await quiz.getByRole("button", { name: /Próxima pergunta/ }).click();
  await expect(quiz).toContainText("2 DE 3");
});
