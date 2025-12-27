require("dotenv").config();
const { Telegraf } = require("telegraf");
const {
  fetchDaftarNilaiWithLogin
} = require("./simaClient");
const parseDaftarNilai = require("./parseDaftarNilai");

const bot = new Telegraf(process.env.BOT_TOKEN);

/* =========================
   UTIL: ESCAPE MARKDOWN
========================= */
function escapeMD(text = "") {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
}

/* =========================
   UTIL: SPLIT MESSAGE
========================= */
async function sendLongMessage(ctx, text) {
  const MAX = 3900;
  let chunk = "";

  for (const line of text.split("\n")) {
    if ((chunk + line).length > MAX) {
      await ctx.reply(chunk, { parse_mode: "Markdown" });
      chunk = "";
    }
    chunk += line + "\n";
  }

  if (chunk.trim()) {
    await ctx.reply(chunk, { parse_mode: "Markdown" });
  }
}

/* =========================
   COMMAND /nilai
========================= */
bot.command("nilai", async ctx => {
  const args = ctx.message.text.split(" ");

  if (args.length < 3) {
    return ctx.reply(
      "❗ Format salah\n\n" +
      "Gunakan:\n" +
      "`/nilai NIM PASSWORD`\n\n" +
      "Contoh:\n" +
      "`/nilai G.111.24.0021 12345678`",
      { parse_mode: "Markdown" }
    );
  }

  const nim = args[1];
  const password = args.slice(2).join(" ");

  await ctx.reply("⏳ Mengambil data nilai, mohon tunggu...");

  try {
    /* === FETCH & PARSE === */

    const html = await fetchDaftarNilaiWithLogin(nim, password);
    const hasil = parseDaftarNilai(html);

console.log("────────────────────────────");
console.log("[TELEGRAM BOT] Login berhasil");
console.log(`Nama : ${result.nama}`);
console.log(`NIM  : ${result.nim}`);
console.log(`IPK  : ${result.ipk}`);
console.log(`Total MK : ${result.total_makul}`);
console.log("────────────────────────────");

    /* === FORMAT TELEGRAM === */
    let message =
      `👤 *${escapeMD(hasil.nama)}*\n` +
      `📊 *IPK:* ${hasil.ipk}\n` +
      `📚 *Total Mata Kuliah:* ${hasil.total_makul}\n\n` +
      `━━━━━━━━━━━━━━━━━━━\n`;

    hasil.data.forEach((m, i) => {
      message +=
        `${i + 1}. *${escapeMD(m.matkul)}*\n` +
        `   • Kode: ${escapeMD(m.kode)}\n` +
        `   • Semester: ${m.semester}\n` +
        `   • SKS: ${m.sks}\n` +
        `   • Nilai: ${escapeMD(m.nilai || "-")}\n\n`;
    });

    await sendLongMessage(ctx, message);

  } catch (err) {
  console.error("[BOT ERROR]", err.message);

  if (err.code === "LOGIN_FAILED" || err.message.includes("Login")) {
    await ctx.reply("❌ Login gagal.\nPastikan NIM & password benar.");
    return;
  }

  if (err.message.includes("Session")) {
    await ctx.reply("⚠️ Session tidak valid. Silakan coba lagi.");
    return;
  }

  await ctx.reply(
    "⚠️ Data berhasil diambil, tetapi gagal ditampilkan.\nSilakan coba lagi."
  );
}
});

/* =========================
   START BOT
========================= */
bot.launch();
console.log("🤖 Bot SIMA berjalan...");

/* =========================
   GRACEFUL SHUTDOWN
========================= */
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
