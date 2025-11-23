// api/telegram.js - versione semplice con log per il token

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_SEND_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

console.log(
  "TELEGRAM_BOT_TOKEN presente:",
  !!process.env.TELEGRAM_BOT_TOKEN
);
console.log("TELEGRAM_TOKEN usato:", TELEGRAM_TOKEN);

// Legge il body raw della richiesta (necessario su Vercel per i webhook Telegram)
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      resolve(data);
    });
    req.on("error", reject);
  });
}

// Risposta semplice: niente OpenAI per ora
async function generaRisposta(userText) {
  return `Hai scritto: ${userText}`;
}

// Handler principale per il webhook Telegram
module.exports = async (req, res) => {
  try {
    if (req.method === "POST") {
      const rawBody = await readBody(req);

      let update = {};
      try {
        update = JSON.parse(rawBody || "{}");
      } catch (e) {
        console.error("Errore nel parse del body Telegram:", e, rawBody);
      }

      console.log("Update Telegram ricevuto:", JSON.stringify(update));

      const message = update.message;
      const text = message?.text;
      const chatId = message?.chat?.id;

      if (!TELEGRAM_TOKEN) {
        console.error(
          "ATTENZIONE: TELEGRAM_TOKEN è undefined. Controlla TELEGRAM_BOT_TOKEN su Vercel."
        );
      }

      if (chatId && text && TELEGRAM_TOKEN) {
        const reply = await generaRisposta(text);

        try {
          const tgResp = await fetch(TELEGRAM_SEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: reply,
            }),
          });

          const tgText = await tgResp.text();
          console.log(
            "Risposta Telegram sendMessage:",
            tgResp.status,
            tgText
          );
        } catch (e) {
          console.error("Errore nella chiamata Telegram sendMessage:", e);
        }
      } else {
        console.log(
          "Nessun chatId o text o token mancante:",
          "chatId =",
          message?.chat?.id,
          "text =",
          message?.text,
          "TELEGRAM_TOKEN presente =",
          !!TELEGRAM_TOKEN
        );
      }

      return res.status(200).send("OK");
    }

    // GET di test da browser
    return res.status(200).send("OK");
  } catch (err) {
    console.error("Errore nel webhook Telegram:", err);
    return res.status(200).send("OK");
  }
};
