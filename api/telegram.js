// api/telegram.js - versione CommonJS per Vercel

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const TELEGRAM_SEND_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
const OPENAI_URL = "https://api.openai.com/v1/responses";

async function generaRispostaElegante(userText) {
  try {
    const prompt = `
Sei un assistente virtuale che risponde in italiano in modo:
- elegante
- chiaro
- sintetico ma completo
- professionale, senza parolacce

Rispondi in massimo 3-4 frasi, andando dritto al punto.

Domanda dell'utente: "${userText}"
Risposta (solo testo, senza premesse):`;

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
      "Posso chiederti di riformulare la domanda? Così posso rispondere meglio.";

    return output;
  } catch (err) {
    console.error("Errore OpenAI:", err);
    return "Sto avendo un problema tecnico, riprova tra qualche istante.";
  }
}

// handler in stile CommonJS
module.exports = async (req, res) => {
  try {
    if (req.method === "POST") {
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
    }

    // GET di test
    return res.status(200).send("OK");
  } catch (err) {
    console.error("Errore nel webhook Telegram:", err);
    return res.status(200).send("OK");
  }
};
