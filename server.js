const express = require("express");
const pino = require("pino");
const {
  default: makeWASocket,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys");

const app = express();
app.use(express.json());
app.use(express.static("public"));

async function generateCode(number) {
  const { state } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" })
  });

  return new Promise(async (resolve, reject) => {
    try {
      if (!sock.authState.creds.registered) {
        const code = await sock.requestPairingCode(number);
        resolve(code);
      } else {
        resolve("Already registered");
      }
    } catch (err) {
      reject(err.message);
    }
  });
}

// API route
app.post("/pair", async (req, res) => {
  const { number } = req.body;

  if (!number) {
    return res.json({ error: "Number required" });
  }

  try {
    const code = await generateCode(number);
    res.json({ code });
  } catch (err) {
    res.json({ error: err });
  }
});

app.listen(3000, () => {
  console.log("🚀 Pairing website running on port 3000");
});
