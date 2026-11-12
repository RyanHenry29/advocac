// Bateria de browser — rodada 2 (Edge real via playwright-core)
// Uso: node tests/round2/browser.mjs <baseURL>
import { chromium } from "playwright-core";

const base = process.argv[2] || "http://127.0.0.1:3103";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

let pass = 0;
let fail = 0;
const check = (name, cond, detail = "") => {
  cond ? pass++ : fail++;
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

async function dismissIntro(page) {
  // espera a hidratação anexar o listener de click do overlay, depois clica;
  // animação de saída do intro ~1.15s + finishIntro
  await page.waitForTimeout(900);
  await page.mouse.click(20, 20);
  await page.waitForTimeout(2000);
}

async function rejectCookies(page) {
  // banner trava o scroll do body até a escolha — recusa destrava e limpa o rodapé
  const recusar = page.getByRole("button", { name: "Recusar", exact: true });
  if (await recusar.isVisible().catch(() => false)) {
    await recusar.click({ timeout: 5000 });
    await page.waitForTimeout(200);
  }
}

async function acceptCookies(page) {
  await page.getByRole("button", { name: "Aceitar", exact: true }).click({ timeout: 8000 });
}

const browser = await chromium.launch({ executablePath: EDGE, headless: true });

// ---------- 1) GA/GTM + consentimento (desktop) ----------
console.log("\n=== 1) ANALYTICS + CONSENTIMENTO ===\n");
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));

  await page.goto(base + "/", { waitUntil: "domcontentloaded" });
  await dismissIntro(page);

  const before = await page.evaluate(() => ({
    gtag: !!document.querySelector('script[src*="gtag/js"]'),
    gtm: !!document.querySelector('script[src*="gtm.js"]'),
    dataLayer: Array.isArray(window.dataLayer) ? window.dataLayer.length : -1
  }));
  check("sem consentimento: sem script GA", before.gtag === false);
  check("sem consentimento: sem script GTM", before.gtm === false);

  await acceptCookies(page);
  await page.waitForTimeout(2500);

  const after = await page.evaluate(() => {
    const gtagScript = document.querySelector('script[src*="gtag/js"]');
    const gtmScript = document.querySelector('script[src*="gtm.js"]');
    const dl = Array.isArray(window.dataLayer) ? window.dataLayer : [];
    const configEntry = dl.find(
      (a) => Array.isArray(a) && a[0] === "config" && String(a[1]).includes("G-TEST123")
    );
    return {
      gtagSrc: gtagScript ? gtagScript.getAttribute("src") : null,
      gtmSrc: gtmScript ? gtmScript.getAttribute("src") : null,
      hasConfig: Boolean(configEntry),
      dlLen: dl.length
    };
  });
  check(
    "aceite: script GA4 injetado",
    after.gtagSrc !== null && after.gtagSrc.includes("G-TEST123"),
    after.gtagSrc || "null"
  );
  check(
    "aceite: script GTM injetado",
    after.gtmSrc !== null && after.gtmSrc.includes("GTM-TEST123"),
    after.gtmSrc || "null"
  );
  check(
    "aceite: gtag config registrado no dataLayer",
    after.hasConfig,
    `dataLayer itens=${after.dlLen}`
  );

  // revogação: abrir preferências, desligar analytics, salvar
  await page.getByRole("button", { name: "Configurar cookies" }).click();
  await page.getByRole("button", { name: "Preferências" }).click();
  await page.waitForTimeout(300);
  const switches = page.locator('[role="switch"]');
  const analyticsOn = await switches.nth(0).getAttribute("aria-checked");
  if (analyticsOn === "true") await switches.nth(0).click();
  await page.getByRole("button", { name: "Salvar preferências" }).click();
  await page.waitForTimeout(1500);

  const revoked = await page.evaluate(() => ({
    gtag: !!document.querySelector('script[src*="gtag/js"]'),
    gtm: !!document.querySelector('script[src*="gtm.js"]')
  }));
  check(
    "revogação: script GA removido do DOM",
    revoked.gtag === false,
    `gtag presente=${revoked.gtag}`
  );
  check(
    "revogação: script GTM removido do DOM",
    revoked.gtm === false,
    `gtm presente=${revoked.gtm}`
  );

  check("sem exceções JS na página", pageErrors.length === 0, pageErrors.join(" | "));
  await ctx.close();
}

// ---------- 2) Recusa em 1 clique ----------
console.log("\n=== 2) RECUSA DE COOKIES (1 clique) ===\n");
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "domcontentloaded" });
  await dismissIntro(page);
  const t0 = Date.now();
  await page.getByRole("button", { name: "Recusar", exact: true }).click({ timeout: 8000 });
  await page
    .locator('[role="dialog"][aria-label="Preferências de cookies"]')
    .waitFor({ state: "detached", timeout: 3000 });
  const elapsed = Date.now() - t0;
  const hasScript = await page.evaluate(
    () => !!document.querySelector('script[src*="gtag/js"], script[src*="gtm.js"]')
  );
  const consent = await page.evaluate(() => localStorage.getItem("advocac-cookie-consent"));
  check("recusa em 1 clique (<2s até banner fechar)", elapsed < 2000, `${elapsed}ms`);
  check("recusa: nenhum script de analytics", hasScript === false);
  check(
    "recusa: consentimento salvo com analytics=false",
    consent !== null && consent.includes('"analytics":false')
  );
  await ctx.close();
}

// ---------- 3) FAQ aria-expanded ----------
console.log("\n=== 3) FAQ ACESSIBILIDADE ===\n");
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(base + "/central-cac", { waitUntil: "domcontentloaded" });
  await dismissIntro(page);
  await rejectCookies(page);
  // mata smooth-scroll e transições do Reveal para o click ser estável
  await page.addStyleTag({
    content:
      "html{scroll-behavior:auto!important}*,*::before,*::after{transition-duration:0s!important;animation-duration:0s!important}"
  });

  const btn = page.locator("button[aria-controls]").first();
  await btn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const expandedBefore = await btn.getAttribute("aria-expanded");
  const controlsId = await btn.getAttribute("aria-controls");
  const panelExists = (await page.locator(`[id="${controlsId}"]`).count()) > 0;
  check("FAQ botão tem aria-expanded=false inicial", expandedBefore === "false");
  check("FAQ botão tem aria-controls apontando painel", panelExists, `id=${controlsId}`);

  await btn.click();
  await page.waitForTimeout(400);
  const expandedOpen = await btn.getAttribute("aria-expanded");
  const panelVisible = await page.locator(`[id="${controlsId}"]`).isVisible();
  check("abrir → aria-expanded=true", expandedOpen === "true");
  check("abrir → painel visível", panelVisible);

  await btn.click();
  await page.waitForTimeout(400);
  const expandedClosed = await btn.getAttribute("aria-expanded");
  check("fechar → aria-expanded=false", expandedClosed === "false");
  await ctx.close();
}

// ---------- 4) Mobile 375×812 ----------
console.log("\n=== 4) MOBILE 375×812 ===\n");
{
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    hasTouch: true,
    isMobile: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
  });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));

  for (const path of ["/", "/contato", "/central-cac", "/atendimento"]) {
    await page.goto(base + path, { waitUntil: "domcontentloaded" });
    await dismissIntro(page);
    await rejectCookies(page);
    const overflow = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth
    }));
    check(
      `sem overflow horizontal em ${path}`,
      overflow.scrollW <= overflow.innerW + 1,
      `scrollW=${overflow.scrollW} innerW=${overflow.innerW}`
    );
  }

  // menu hambúrguer
  await page.goto(base + "/", { waitUntil: "domcontentloaded" });
  await dismissIntro(page);
  await rejectCookies(page);
  const burger = page.locator('button[aria-label="Abrir menu"]');
  check("hambúrguer visível no mobile", await burger.isVisible());
  await burger.click();
  await page.waitForTimeout(400);
  const expanded = await page.locator('button[aria-label="Fechar menu"]').getAttribute("aria-expanded");
  check("menu abre (aria-expanded=true)", expanded === "true");
  const navVisible = await page.locator('nav[aria-label="Navegação mobile"]').isVisible();
  check("nav mobile visível", navVisible);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  const burgerAgain = await page.locator('button[aria-label="Abrir menu"]').count();
  check("Esc fecha o menu", burgerAgain === 1);

  // chat widget mobile
  const chatBtn = page.getByRole("button", { name: "Fale com a equipe Advocac" });
  check("botão do chat visível", await chatBtn.isVisible());
  await chatBtn.click();
  await page.waitForTimeout(500);
  const dialog = page.locator('[role="dialog"][aria-label="Atendimento Advocac"]');
  check("chat abre como dialog", await dialog.isVisible());
  const dialogBox = await dialog.boundingBox();
  check(
    "chat ocupa a tela no mobile",
    dialogBox !== null && dialogBox.width >= 370,
    dialogBox ? `w=${Math.round(dialogBox.width)}` : "null"
  );
  await page.getByRole("button", { name: "Fechar atendimento" }).click();

  check("sem exceções JS no mobile", pageErrors.length === 0, pageErrors.join(" | "));
  await ctx.close();
}

// ---------- 5) Âncoras do rodapé ----------
console.log("\n=== 5) ÂNCORAS DO RODAPÉ ===\n");
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(base + "/central-cac", { waitUntil: "domcontentloaded" });
  await dismissIntro(page);
  await rejectCookies(page);
  for (const id of ["portal-pf", "habitualidade", "craf"]) {
    const count = await page.locator(`[id="${id}"]`).count();
    check(`âncora #${id} existe na Central CAC`, count > 0, `elementos=${count}`);
  }
  await ctx.close();
}

// ---------- 6) Intro 1× por sessão ----------
console.log("\n=== 6) INTRO 1× POR SESSÃO ===\n");
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(700);
  const overlayFirst = await page.locator('div[aria-hidden="true"].fixed.inset-0.z-\\[100\\]').count();
  check("1ª visita: overlay da intro presente", overlayFirst > 0, `count=${overlayFirst}`);
  await dismissIntro(page);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);
  const overlaySecond = await page.locator('div[aria-hidden="true"].fixed.inset-0.z-\\[100\\]').count();
  check("reload na mesma sessão: overlay NÃO reaparece", overlaySecond === 0, `count=${overlaySecond}`);
  await ctx.close();
}

// ---------- 7) LeadForm → popup WhatsApp ----------
console.log("\n=== 7) FORM DE LEADS → WHATSAPP ===\n");
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(base + "/contato", { waitUntil: "domcontentloaded" });
  await dismissIntro(page);
  await rejectCookies(page);

  const popupPromise = page.waitForEvent("popup", { timeout: 8000 }).catch(() => null);
  await page.fill("#lead-name", "Teste Browser");
  await page.fill("#lead-whatsapp", "11912345678");
  await page.fill("#lead-message", "CRAF vencendo");
  await page.click('button[type="submit"]');
  const popup = await popupPromise;
  check("submit abre popup (window.open)", popup !== null);
  if (popup) {
    await popup.waitForLoadState("domcontentloaded").catch(() => {});
    const url = popup.url();
    check(
      "popup navega para wa.me com resumo",
      url.includes("wa.me") || url === "about:blank",
      url.slice(0, 80)
    );
    await popup.close().catch(() => {});
  }
  await page.waitForTimeout(1000);
  const sentMsg = await page.getByText("Mensagem registrada.").count();
  check("confirmação 'Mensagem registrada' aparece", sentMsg > 0);
  await ctx.close();
}

// ---------- 8) Hero image carrega ----------
console.log("\n=== 8) IMAGENS ===\n");
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "load" });
  await dismissIntro(page);
  await rejectCookies(page);
  const hero = await page.evaluate(() => {
    const img = document.querySelector('img[src*="hero"], img[fetchpriority="high"], img[loading="eager"]');
    if (!img) return null;
    return { complete: img.complete, naturalWidth: img.naturalWidth, src: (img.currentSrc || img.src).slice(-40) };
  });
  check(
    "hero image carregada (naturalWidth>0)",
    hero !== null && hero.complete && hero.naturalWidth > 0,
    hero ? `w=${hero.naturalWidth} …${hero.src}` : "img não encontrado"
  );
  await ctx.close();
}

await browser.close();
console.log(`\n=== RESULTADO: ${pass} PASS, ${fail} FAIL ===\n`);
process.exitCode = fail > 0 ? 1 : 0;
