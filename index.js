const express = require("express");
const path = require("path");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let sock;

// =======================
// WHATSAPP CONNECTION
// =======================
async function startBot(phone) {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  // pairing code (NO QR)
  if (phone) {
    const code = await sock.requestPairingCode(phone);
    console.log("PAIRING CODE:", code);
  }

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason !== DisconnectReason.loggedOut) {
        startBot(phone);
      }
    }

    if (connection === "open") {
      console.log("✅ BOT CONNECTED");
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

// =======================
// API ROUTE (PAIRING)
// =======================
app.post("/pair", async (req, res) => {
  const { number } = req.body;

  if (!number) {
    return res.status(400).json({ error: "Number required" });
  }

  try {
    await startBot(number);
    res.json({ success: true, message: "Check server logs for pairing code" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =======================
// WEBSITE ROUTE
// =======================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// =======================
app.listen(PORT, () => {
  console.log("LANEZTECH RUNNING ON PORT", PORT);
});
