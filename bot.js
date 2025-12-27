require("dotenv").config();

const { getUpdates, sendMessage } = require("./telegram");
const { fetchDaftarNilaiPlaywright } = require("./simaBrowser");
const { parseDaftarNilai } = require("./parseDaftarNilai");
const { formatNilaiTelegram } = require("./formatTelegram");

let offset = 0;

console.log("🤖 Bot SIMA Telegram berjalan...");

async function startBot() {
  while (true) {
    const updates = await getUpdates(offset);

    for (const update of updates) {
      offset = update.update_id + 1;

      if (!update.message?.text) continue;

      const chatId = update.message.chat.id;
      const text = update.message.text.trim();

      if (!text.startsWith("/nilai")) continue;

      const args = text.split(" ");
      if (args.length < 3) {
        await sendMessage(
          chatId,
          "❌ Format salah\nGunakan:\n`/nilai NIM PASSWORD`"
        );
        continue;
      }

      const nim = args[1];
      const password = args.slice(2).join(" ");

      await sendMessage(chatId, "⏳ Login SIMA, mohon tunggu...");

      try {
        const html = await fetchDaftarNilaiPlaywright(nim, password);
        const parsed = parseDaftarNilai(html);
        const msg = formatNilaiTelegram(nim, parsed);

        await sendMessage(chatId, msg);
      } catch (err) {
        let msg = "❌ Terjadi kesalahan";

        if (err.message === "LOGIN_GAGAL") {
          msg = "❌ Login gagal\nCek NIM atau password";
        } else if (err.message === "NIM_PASSWORD_KOSONG") {
          msg = "❌ NIM atau password kosong";
        } else if (err.message === "HTML_KOSONG") {
          msg = "⚠️ SIMA sedang bermasalah";
        }

        await sendMessage(chatId, msg);
      }
    }
  }
}

startBot();
