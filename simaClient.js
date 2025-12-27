// simaClient.js
const axios = require("axios");
const cheerio = require("cheerio");
const { CookieJar } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");

/* =========================
   CLIENT SETUP
========================= */

function createClient() {
  const jar = new CookieJar();

  return wrapper(
    axios.create({
      jar,
      withCredentials: true,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    })
  );
}

/* =========================
   LOGIN
========================= */

async function loginSIMA(client, nim, password) {
  console.log("🔹 GET halaman login");

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
    }),
    {
      maxRedirects: 0,
      validateStatus: s => s < 500
    }
  );

  const redirect = res.headers.location;
  if (!redirect || !redirect.includes("/app")) {
    throw new Error("Login gagal");
  }

  console.log("✅ Login berhasil");
}

/* =========================
   AKTIVASI SISTEM AKADEMIK
========================= */

async function activateAkademik(client) {
  console.log("🔹 GET /app");
  await client.get("https://sima.usm.ac.id/app");

  console.log("🔹 POST /app/routes");
  await client.post(
    "https://sima.usm.ac.id/app/routes",
    new URLSearchParams({
      id_aplikasi: "05494017904153",
      level_key: "6f1e80f8-4fb3-11ea-9ef2-1cb72c27dd68",
      id_bidang: "1"
    })
  );

  console.log("✅ Sistem Akademik aktif");
}

/* =========================
   FETCH DAFTAR NILAI
========================= */

async function fetchDaftarNilai(client) {
  console.log("📥 GET daftar nilai");

  const res = await client.get(
    "https://sima.usm.ac.id/histori_pendidikan/daftar_nilai"
  );

  if (res.request.res.responseUrl.includes("/login")) {
    throw new Error("Session tidak valid (terpental ke login)");
  }

  return res.data;
}

/* =========================
   HIGH LEVEL FUNCTION
========================= */

async function fetchDaftarNilaiWithLogin(nim, password) {
  const client = createClient();

  await loginSIMA(client, nim, password);
  await activateAkademik(client);

  return fetchDaftarNilai(client);
}

module.exports = {
  createClient,
  loginSIMA,
  activateAkademik,
  fetchDaftarNilai,
  fetchDaftarNilaiWithLogin
};
