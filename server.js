const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// PORT
// =====================
const PORT = process.env.PORT || 3000;

// =====================
// FOLDERS
// =====================
const publicDir = path.join(__dirname, "public");
const sessionsDir = path.join(__dirname, "sessions");

// create sessions folder if missing
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir);
}

// =====================
// SERVE FRONTEND
// =====================
app.use(express.static(publicDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// =====================
// SIMPLE RATE LIMIT STORAGE
// =====================
const cooldown = new Map();

// =====================
// PAIRING FUNCTION (MOCK OR REAL BAILEYS LATER)
// =====================
async function createPairingCode(number) {
  await new Promise((r) => setTimeout(r, 1200));

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

// =====================
// API: PAIR DEVICE
// =====================
app.post("/api/pair", async (req, res) => {
  try {
    const { number } = req.body;

    if (!number) {
      return res.json({
        success: false,
        message: "Number required"
      });
    }

    // anti spam cooldown (10s)
    const last = cooldown.get(number);
    const now = Date.now();

    if (last && now - last < 10000) {
      return res.json({
        success: false,
        message: "Wait before retrying"
      });
    }

    cooldown.set(number, now);

    const clean = number.replace(/\D/g, "");

    const code = await createPairingCode(clean);

    // save session
    fs.writeFileSync(
      path.join(sessionsDir, `${clean}.json`),
      JSON.stringify(
        {
          number: clean,
          code,
          time: new Date().toISOString()
        },
        null,
        2
      )
    );

    // IMPORTANT: frontend expects "code"
    return res.json({
      success: true,
      code: code
    });
  } catch (err) {
    console.error("PAIR ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// =====================
// STATUS ROUTE
// =====================
app.get("/api/status", (req, res) => {
  const sessionCount = fs.readdirSync(sessionsDir).length;

  res.json({
    success: true,
    status: "online",
    sessions: sessionCount
  });
});

// =====================
// START SERVER
// =====================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
