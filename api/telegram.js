// api/telegram.js

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const TELEGRAM_SEND_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
const OPENAI_URL = "https://api.openai.com/v1/responses";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const update = req.body || {};
      const message = update.message;
      const text = message?.text;
      const chatId = message?.chat?.id;

      if (chatId && text) {
        const reply = await generaRispostaElegante(text);

        await fetch(TELEGRAM_SEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: reply,
          }),
        });
      }

      return res.status(200).send("OK");
    } catch (err) {
      console.error("Errore nel webhook Telegram:", err);
      return res.status(200).send("OK");
    }
  }

  return res.status(200).send("OK");
}

async function generaRispostaElegante(userText) {
  try {
    const prompt = `
Sei un assistente virtuale elegante e professionale.
Rispondi in poche frasi, in modo chiaro, preciso e cortese.

Domanda: "${userText}"
Risposta:`;

    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
      }),
    });

    const data = await response.json();

    const output =
      data?.output?.[0]?.content?.[0]?.text?.trim() ||
      "Potresti riformulare? Così posso rispondere meglio.";

    r
