const TelegramBot = require("node-telegram-bot-api");
const { fetchDaftarNilaiPlaywright } = require("./simaBrowser");
const { parseDaftarNilai } = require("./parseDaftarNilai");

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  if (!text.startsWith("/nilai")) return;

  const parts = text.split(" ");

  if (parts.length < 3) {
    return bot.sendMessage(
      chatId,
      "❌ Format salah\nGunakan:\n/nilai NIM PASSWORD"
    );
  }

  const nim = parts[1];
  const password = parts[2];

  const loadingMsg = await bot.sendMessage(
    chatId,
    "⏳ Mengambil data nilai dari SIMA..."
  );

  try {
    const html = await fetchDaftarNilaiPlaywright(nim, password);
    const hasil = parseDaftarNilai(html);

    let pesan = `🎓 *Daftar Nilai*\n`;
    pesan += `👤 *${hasil.nama}*\n`;
    pesan += `🆔 ${hasil.nim}\n\n`;

    for (const item of hasil.nilai) {
      pesan += `• ${item.makul} (${item.sks} SKS) → ${item.nilai}\n`;
    }

    pesan += `\n📊 *IPK:* ${hasil.ipk}`;
    pesan += `\n📚 *Total SKS:* ${hasil.totalSks}`;

    await bot.editMessageText(pesan, {
      chat_id: chatId,
      message_id: loadingMsg.message_id,
      parse_mode: "Markdown"
    });

  } catch (err) {
    console.error("❌ ERROR BOT:", err);

    let userMessage = "❌ Terjadi kesalahan tidak diketahui";

    // 🔽 mapping error
    if (err.message === "LOGIN_GAGAL") {
      userMessage = "❌ Login gagal\nCek NIM atau password";
    } else if (err.message === "NIM_PASSWORD_KOSONG") {
      userMessage = "❌ NIM atau password kosong";
    } else if (err.message.includes("HTML")) {
      userMessage = "❌ Data nilai kosong atau belum tersedia";
    } else if (err.message.includes("timeout")) {
      userMessage = "⏳ SIMA lambat, coba lagi beberapa saat";
    }

    await bot.editMessageText(userMessage, {
      chat_id: chatId,
      message_id: loadingMsg.message_id
    });
  }
});

console.log("🤖 Bot Telegram SIMA aktif");
