const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const { startBot } = require("./lib/baileys");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("public"));

const sessions = new Map();

// =====================
// DASHBOARD
// =====================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =====================
// CREATE SESSION (REAL)
// =====================
app.post("/api/pair", async (req, res) => {
  const { number } = req.body;

  if (!number) {
    return res.json({ success: false, message: "Number required" });
  }

  const sessionId = number.replace(/\D/g, "");

  if (sessions.has(sessionId)) {
    return res.json({
      success: true,
      code: "SESSION_ACTIVE"
    });
  }

  sessions.set(sessionId, { status: "starting" });

  const sock = await startBot(sessionId, (status) => {
    sessions.set(sessionId, { status });
    io.emit("status", { sessionId, status });
  });

  // real pairing code (Baileys style)
  let code = "WAITING...";

  sock.ev.on("connection.update", async (update) => {
    const pairingCode = update?.pairingCode;

    if (pairingCode) {
      code = pairingCode;
      io.emit("code", { sessionId, code });
    }
  });

  res.json({
    success: true,
    code: "GENERATING..."
  });
});

// =====================
// STATUS API
// =====================
app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    sessions: sessions.size,
    data: Array.from(sessions.entries())
  });
});

// =====================
// SOCKET LIVE DASHBOARD
// =====================
io.on("connection", (socket) => {
  socket.emit("init", {
    sessions: Array.from(sessions.entries())
  });
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("🚀 V4 Engine running on port", PORT);
});
