const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// CONFIG
// =====================
const PORT = process.env.PORT || 3000;

// sessions folder (auto create)
const sessionsDir = path.join(__dirname, "sessions");
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir);
}

// =====================
// SIMPLE MEMORY STORE (anti spam)
// =====================
const requestMap = new Map();

// =====================
// MOCK / REAL PAIRING FUNCTION
// Replace this with Baileys logic later
// =====================
async function createPairingCode(number) {
  // simulate delay like real WhatsApp pairing
  await new Promise((r) => setTimeout(r, 1500));

  // generate fake but realistic code
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

// =====================
// API ROUTE: PAIR DEVICE
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

    // basic spam protection (10 sec cooldown per number)
    const lastTime = requestMap.get(number);
    const now = Date.now();

    if (lastTime && now - lastTime < 10000) {
      return res.json({
        success: false,
        message: "Please wait before retrying"
      });
    }

    requestMap.set(number, now);

    const cleanNumber = number.replace(/\D/g, "");

    // generate pairing code
    const code = await createPairingCode(cleanNumber);

    // OPTIONAL: save session file
    const sessionFile = path.join(sessionsDir, `${cleanNumber}.json`);
    fs.writeFileSync(
      sessionFile,
      JSON.stringify(
        {
          number: cleanNumber,
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
      message: "Internal server error"
    });
  }
});

// =====================
// STATUS ROUTE (for dashboard)
// =====================
app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    status: "online",
    sessions: fs.readdirSync(sessionsDir).length
  });
});

// =====================
// START SERVER
// =====================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
