const axios = require("axios");
const cheerio = require("cheerio");
const { CookieJar } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");
const HttpsProxyAgent = require("https-proxy-agent");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// 🔐 ZenRows Proxy
const PROXY = `http://${process.env.ZENROWS_API_KEY}:@api.zenrows.com:8001`;

function createClient() {
  const jar = new CookieJar();
  const agent = new HttpsProxyAgent(PROXY);

  return wrapper(
    axios.create({
      jar,
      withCredentials: true,
      httpsAgent: agent,
      httpAgent: agent,
      timeout: 30000,
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
      }
    })
  );
}

/* =========================
   LOGIN
========================= */
async function loginSIMA(client, nim, password) {
  console.log(`🔹 GET login page | ${nim}`);

  const loginPage = await client.get("https://sima.usm.ac.id/");
  const $ = cheerio.load(loginPage.data);

  const token = $('input[name="token"]').val();
  if (!token) throw new Error("Token login tidak ditemukan");

  console.log("🔹 POST login");

  const res = await client.post(
    "https://sima.usm.ac.id/login",
    new URLSearchParams({
      username: nim,
      password,
      token
    }).toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      maxRedirects: 0,
      validateStatus: s => s < 500
    }
  );

  if (!res.headers.location?.includes("/app")) {
    throw new Error("Login gagal");
  }

  console.log(`✅ Login sukses | ${nim}`);
}

/* =========================
   AKTIVASI AKADEMIK
========================= */
async function activateAkademik(client) {
  await client.get("https://sima.usm.ac.id/app");

  await client.post(
    "https://sima.usm.ac.id/app/routes",
    new URLSearchParams({
      id_aplikasi: "05494017904153",
      level_key: "6f1e80f8-4fb3-11ea-9ef2-1cb72c27dd68",
      id_bidang: "1"
    }).toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    }
  );

  console.log("✅ Sistem Akademik aktif");
}

/* =========================
   FETCH NILAI
========================= */
async function fetchDaftarNilai(client) {
  const res = await client.get(
    "https://sima.usm.ac.id/histori_pendidikan/daftar_nilai"
  );

  if (res.request.res.responseUrl.includes("/login")) {
    throw new Error("Session tidak valid");
  }

  return res.data;
}

/* =========================
   HIGH LEVEL
========================= */
async function fetchDaftarNilaiWithLogin(nim, password) {
  const client = createClient();
  await loginSIMA(client, nim, password);
  await activateAkademik(client);
  return fetchDaftarNilai(client);
}

module.exports = {
  fetchDaftarNilaiWithLogin
};
