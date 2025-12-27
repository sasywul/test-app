const axios = require("axios");

const TOKEN = process.env.TELEGRAM_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${TOKEN}`;

async function sendMessage(chatId, text) {
  return axios.post(`${BASE_URL}/sendMessage`, {
    chat_id: chatId,
    text,
    parse_mode: "Markdown"
  });
}

async function getUpdates(offset) {
  const res = await axios.get(`${BASE_URL}/getUpdates`, {
    params: {
      timeout: 30,
      offset
    }
  });
  return res.data.result || [];
}

module.exports = { sendMessage, getUpdates };
