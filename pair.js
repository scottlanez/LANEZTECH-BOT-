const express = require("express");
const router = express.Router();

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

let sock;

async function startSession(number) {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  const code = await sock.requestPairingCode(number);

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason !== DisconnectReason.loggedOut) {
        startSession(number);
      }
    }
  });

  return code;
}

router.post("/pair", async (req, res) => {
  try {
    const { number } = req.body;

    if (!number) {
      return res.status(400).json({ error: "Number required" });
    }

    const code = await startSession(number);

    res.json({
      success: true,
      pairingCode: code
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
