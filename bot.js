require("dotenv").config();
const { Telegraf } = require("telegraf");

const { fetchDaftarNilaiWithLogin } = require("./simaClient");
const parseDaftarNilai = require("./parseDaftarNilai");

const bot = new Telegraf(process.env.BOT_TOKEN);

console.log("🤖 Bot SIMA berjalan...");

/* =========================
   UTIL: SPLIT MESSAGE
========================= */
function splitMessage(text, maxLength = 3900) {
  const parts = [];
  let current = "";

  for (const line of text.split("\n")) {
    if ((current + line + "\n").length > maxLength) {
      parts.push(current);
      current = "";
    }
    current += line + "\n";
  }

  if (current) parts.push(current);
  return parts;
}

/* =========================
   COMMAND /nilai
========================= */
bot.command("nilai", async ctx => {
  const [, nim, password] = ctx.message.text.split(" ");

  if (!nim || !password) {
    return ctx.reply("❌ Format salah.\nGunakan:\n/nilai NIM PASSWORD");
  }

  try {
    await ctx.reply("⏳ Mengambil data nilai, mohon tunggu...");

    // =========================
    // FETCH HTML SIMA
    // =========================
    const html = await fetchDaftarNilaiWithLogin(nim, password);

    // =========================
    // PARSE HTML → JSON
    // =========================
    const result = parseDaftarNilai(html);

    if (!result || !result.nama || !result.data?.length) {
      throw new Error("Parsing gagal");
    }

    // =========================
    // LOG KE TERMINAL (SESUSAI REQUEST)
    // =========================
    console.log(`✅ LOGIN OK | ${result.nama} | ${nim}`);

    // =========================
    // FORMAT MESSAGE TELEGRAM
    // =========================
    let message = `👤 *${result.nama}*\n`;
    message += `📊 *IPK:* ${result.ipk}\n`;
    message += `📚 *Total MK:* ${result.total_makul}\n\n`;
    message += `━━━━━━━━━━━━━━━━━━\n`;

    result.data.forEach((m, i) => {
      message += `${i + 1}. *${m.matkul}*\n`;
      message += `   • Semester: ${m.semester}\n`;
      message += `   • SKS: ${m.sks}\n`;
      message += `   • Nilai: ${m.nilai}\n`;
      message += `   • Mutu: ${m.mutu}\n\n`;
    });

    // =========================
    // KIRIM (ANTI MESSAGE TOO LONG)
    // =========================
    const chunks = splitMessage(message);

    for (const chunk of chunks) {
      await ctx.reply(chunk, { parse_mode: "Markdown" });
    }

  } catch (err) {
    console.error(`[BOT ERROR] | ${nim} |`, err.message);

    await ctx.reply(
      "❌ Gagal mengambil nilai.\n" +
      "Pastikan NIM & password benar."
    );
  }
});

/* =========================
   START BOT
========================= */
bot.launch();

/* =========================
   GRACEFUL SHUTDOWN
========================= */
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
