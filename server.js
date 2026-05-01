const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

// WhatsApp (Baileys)
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// =========================
// SIMPLE ADMIN AUTH
// =========================
const ADMIN_KEY = "LANEZ123"; // change later

// =========================
// SESSION STORAGE
// =========================
const SESSION_DIR = path.join(__dirname, "sessions");

// =========================
// WHATSAPP STATE
// =========================
let sock;

// =========================
// INIT WHATSAPP
// =========================
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on("connection.update", (update) => {
    io.emit("log", update);

    if (update.connection === "open") {
      io.emit("status", "connected");
    }

    if (update.connection === "close") {
      io.emit("status", "disconnected");
      startBot(); // auto restart
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

// =========================
// START BOT
// =========================
startBot();

// =========================
// AUTH ROUTE
// =========================
app.post("/api/login", (req, res) => {
  const { key } = req.body;

  if (key === ADMIN_KEY) {
    return res.json({ success: true });
  }

  return res.json({ success: false });
});

// =========================
// SESSION INFO
// =========================
app.get("/api/sessions", (req, res) => {
  if (!fs.existsSync(SESSION_DIR)) return res.json({ count: 0 });

  const files = fs.readdirSync(SESSION_DIR);
  res.json({ count: files.length });
});

// =========================
// PAIR CODE (SIMPLIFIED)
// =========================
app.post("/api/pair", async (req, res) => {
  const { number } = req.body;

  if (!sock) {
    return res.json({ success: false, message: "Bot not ready" });
  }

  try {
    const code = await sock.requestPairingCode(number);

    return res.json({
      success: true,
      code
    });
  } catch (err) {
    return res.json({
      success: false,
      message: err.message
    });
  }
});

// =========================
// SOCKET DASHBOARD
// =========================
io.on("connection", (socket) => {
  socket.emit("status", "connected to dashboard");
});

// =========================
// START SERVER
// =========================
server.listen(3000, () => {
  console.log("LANEZTECH MD V4 RUNNING");
});
