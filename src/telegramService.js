// src/services/telegramService.js

// Hard‑coded credentials
const BOT_TOKEN = "8075320428:AAEh03BbKY131facK9vvpNopfKlEvttMXEM";
const CHAT_ID  = "-1002770492215";

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function _post(method, payload) {
  const res = await fetch(`${API_BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Telegram ${method} failed: ${text}`);
  }
  return res.json();
}

export function sendMessage({ text, parseMode = "HTML", replyMarkup }) {
  return _post("sendMessage", {
    chat_id: CHAT_ID,
    text,
    parse_mode: parseMode,
    ...(replyMarkup && { reply_markup: replyMarkup }),
  });
}

export async function getUpdates(offset) {
  const res = await fetch(`${API_BASE}/getUpdates?offset=${offset}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Telegram getUpdates failed: ${text}`);
  }
  return res.json();
}
