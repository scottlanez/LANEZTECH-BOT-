const express = require("express");
const path = require("path");
const os = require("os");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// =========================
// SYSTEM STATS
// =========================
function getUptime() {
  return Math.floor(process.uptime()) + "s";
}

function getMemory() {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  return used.toFixed(2) + " MB";
}

function getSessions() {
  const dir = path.join(__dirname, "sessions");
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).length;
}

// =========================
// DASHBOARD API
// =========================
app.get("/api/stats", (req, res) => {
  res.json({
    uptime: getUptime(),
    memory: getMemory(),
    sessions: getSessions(),
    platform: os.platform()
  });
});

// =========================
// PAIRING SYSTEM (SIMPLIFIED STABLE)
// =========================
function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

app.post("/api/pair", (req, res) => {
  const { number } = req.body;

  if (!number) {
    return res.json({ success: false, message: "Number required" });
  }

  const clean = number.replace(/\D/g, "");

  if (clean.length < 10) {
    return res.json({ success: false, message: "Invalid number" });
  }

  const code = generateCode();

  return res.json({
    success: true,
    code,
    number: clean
  });
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log("🚀 LANEZTECH MD V3 running on port " + PORT);
});
