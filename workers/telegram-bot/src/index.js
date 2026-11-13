/**
 * OPERAVA Telegram Bot — dedicated Cloudflare Worker
 * Delegates natural-language answers to the public website AVA API so both
 * channels share the same authoritative knowledge, policy and AI behavior.
 */

const API_DEFAULT = "https://www.operavaglobal.com/api/chat";
const BOT_NAME = "OPERAVA Global Solutions";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

async function telegram(env, method, payload) {
  if (!env.TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) {
    console.error("Telegram API error", method, response.status, result.description || "unknown");
    throw new Error("Telegram API request failed");
  }
  return result.result;
}

async function sendText(env, chatId, text, extra = {}) {
  const safeText = String(text || "I’m sorry, I couldn’t prepare a response. Please try again.")
    .slice(0, 4000);
  return telegram(env, "sendMessage", {
    chat_id: chatId,
    text: safeText,
    disable_web_page_preview: true,
    ...extra,
  });
}

async function askAva(env, message, history = []) {
  const endpoint = env.AVA_CHAT_API || API_DEFAULT;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", "accept": "application/json" },
    body: JSON.stringify({ message: String(message).slice(0, 4000), history }),
    signal: AbortSignal.timeout(25000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || typeof result.text !== "string" || !result.text.trim()) {
    console.error("AVA API returned non-success", response.status, result.code || "NO_TEXT");
    throw new Error("AVA service is temporarily unavailable");
  }
  return result.text.trim();
}

function commandOf(text) {
  return String(text || "").trim().split(/\s+/, 1)[0].split("@")[0].toLowerCase();
}

async function handleMessage(env, message) {
  const chatId = message?.chat?.id;
  const text = String(message?.text || "").trim();
  if (!chatId || !text) return;

  const command = commandOf(text);
  if (command === "/start" || command === "/help") {
    await sendText(env, chatId,
      `Welcome to ${BOT_NAME}. I’m AVA, our virtual assistant. I can explain our IT, BPO, automation and cloud services, engagement options, careers, company information and official contact channels.\n\nSend me your question to get started.\n\nUseful commands: /services, /quote, /support, /careers, /contact, /human.`,
      { reply_markup: { keyboard: [[{ text: "/services" }, { text: "/quote" }], [{ text: "/support" }, { text: "/careers" }], [{ text: "/contact" }, { text: "/human" }]], resize_keyboard: true, is_persistent: true } }
    );
    return;
  }

  const shortcuts = {
    "/services": "Please explain the services offered by OPERAVA Global Solutions, including IT and software, BPO, intelligent automation, and cloud services.",
    "/quote": "I would like to request a quotation. Explain the next steps and what information OPERAVA needs to scope my inquiry.",
    "/support": "I need customer support. Explain the official support channel and how I should proceed.",
    "/careers": "Please explain OPERAVA careers, available role tracks, and the official application process.",
    "/contact": "Please provide the best official contact channel for a general business or service inquiry.",
    "/human": "I would like to speak with an OPERAVA representative. Please provide the appropriate official contact channel."
  };

  if (command === "/privacy") {
    await sendText(env, chatId, "Please do not send passwords, OTPs, payment-card details, identity numbers, private customer records or identity-document images in Telegram. For sensitive matters, use the appropriate secure OPERAVA channel.");
    return;
  }

  const prompt = shortcuts[command] || text;
  try {
    const answer = await askAva(env, prompt);
    await sendText(env, chatId, answer);
  } catch (error) {
    console.error("AVA request failed:", error instanceof Error ? error.message : String(error));
    await sendText(env, chatId, "AVA is temporarily unable to connect to our website assistant. Please try again shortly, or contact hello@operavaglobal.com. Website: https://www.operavaglobal.com/contact");
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
      return json({ ok: true, service: "operava-telegram-bot", bot: "@operavaglobalbot", ava: "website-api-proxy", mode: "test" });
    }

    if (request.method !== "POST" || url.pathname !== "/webhook") {
      return json({ error: "Not found" }, 404);
    }

    const expected = env.TELEGRAM_WEBHOOK_SECRET;
    const supplied = request.headers.get("x-telegram-bot-api-secret-token");
    if (!expected || !supplied || supplied !== expected) {
      return json({ error: "Unauthorized" }, 401);
    }

    let update;
    try {
      update = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    // Telegram expects a fast acknowledgement; process the update in the Worker request.
    try {
      if (update.message) await handleMessage(env, update.message);
      else if (update.edited_message) await handleMessage(env, update.edited_message);
    } catch (error) {
      console.error("Update processing failed:", error instanceof Error ? error.message : String(error));
    }
    return json({ ok: true });
  }
};
