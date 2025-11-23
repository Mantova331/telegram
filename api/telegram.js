// api/telegram.js - versione semplice, CommonJS per Vercel

// Token del bot Telegram (impostalo nelle Environment Variables di Vercel)
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// URL base per le chiamate a Telegram
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// Funzione che genera la risposta (ora solo eco, poi possiamo aggiungere l'AI)
async function generaRisposta(userText) {
  // Per iniziare, rispondiamo semplicemente ripetendo il testo
  return `Hai scritto: ${userText}`;
}

// Handler per Vercel (CommonJS)
module.exports = async (req, res) => {
  try {
    console.log("Richiesta ricevuta su /api/telegram, method:", req.method);

    // Per sicurezza: se il token non c'è, log e uscita "soft"
    if (!TELEGRAM_TOKEN) {
      console.error(
        "ATTENZIONE: TELEGRAM_BOT_TOKEN non è impostato nelle variabili di ambiente!"
      );
      return res.status(200).send("OK");
    }

    // Solo POST usate da Telegram per il webhook
    if (req.method === "POST") {
      const update = req.body;
      console.log("Update Telegram ricevuto:", JSON.stringify(update));

      const message = update.message;

      // Se non c'è un messaggio testuale, non facciamo nulla
      if (!message || !message.text) {
        return res.status(200).send("OK");
      }

      const chatId = message.chat.id;
      const userText = message.text;

      // Genera il testo di risposta
      const replyText = await generaRisposta(userText);

      // Invia la risposta a Telegram
      const sendUrl = `${TELEGRAM_API_URL}/sendMessage`;

      console.log("Invio messaggio a Telegram:", {
        chat_id: chatId,
        text: replyText,
      });

      await fetch(sendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: replyText,
        }),
      });

      return res.status(200).send("OK");
    }

    // Per eventuali GET da browser (test veloce)
    return res.status(200).send("OK");
  } catch (err) {
    console.error("Errore nel webhook Telegram:", err);
    return res.status(200).send("OK");
  }
};
