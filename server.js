const express = require("express");
const path = require("path");
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// 🌐 Website route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔥 Pairing API
app.post("/pair", async (req, res) => {
  const { number } = req.body;

  if (!number) return res.json({ error: "Number required" });

  try {
    const { state } = await useMultiFileAuthState("./session");

    const sock = makeWASocket({
      auth: state,
      logger: pino({ level: "silent" })
    });

    const code = await sock.requestPairingCode(number);

    res.json({ code });

  } catch (err) {
    res.json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("🌐 Server running on port", PORT);
});
