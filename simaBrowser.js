// simaBrowser.js (ULTRA LIGHT)
const { chromium } = require("playwright");

async function fetchDaftarNilaiPlaywright(nim, password) {
  if (!nim || !password) throw new Error("NIM_PASSWORD_KOSONG");

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding"
    ]
  });

  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36",
    javaScriptEnabled: true
  });

  // 🔥 BLOCK SEMUA RESOURCE BERAT
  await page.route("**/*", route => {
    const t = route.request().resourceType();
    if (
      t === "image" ||
      t === "media" ||
      t === "font" ||
      t === "stylesheet"
    ) return route.abort();
    route.continue();
  });

  try {
    console.log(`🔹 Login SIMA | ${nim}`);

    // LOGIN PAGE
    await page.goto("https://sima.usm.ac.id/", {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    await page.waitForSelector("#username", { timeout: 60000 });

    await page.fill("#username", nim);
    await page.fill('input[name="password"]', password);

    await Promise.all([
      page.click('input[type="submit"][value="Login System"]'),
      page.waitForNavigation({ timeout: 60000 })
    ]);

    if (!page.url().includes("/app")) {
      throw new Error("LOGIN_GAGAL");
    }

    console.log(`✅ Login sukses | ${nim}`);

    // AKTIFKAN CONTEXT
    await page.goto("https://sima.usm.ac.id/app", {
      waitUntil: "domcontentloaded"
    });

    await page.request.post("https://sima.usm.ac.id/app/routes", {
      form: {
        id_aplikasi: "05494017904153",
        level_key: "6f1e80f8-4fb3-11ea-9ef2-1cb72c27dd68",
        id_bidang: "1"
      }
    });

    // AMBIL NILAI
    await page.goto(
      "https://sima.usm.ac.id/histori_pendidikan/daftar_nilai",
      { waitUntil: "domcontentloaded" }
    );

    const html = await page.content();
    if (!html || html.length < 1000) {
      throw new Error("HTML_KOSONG");
    }

    console.log(`Ambil nilai sukses (${nim})`);
    return html;

  } finally {
    await browser.close();
  }
}

module.exports = { fetchDaftarNilaiPlaywright };
