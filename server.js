const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// Sessions folder
const sessionsDir = path.join(__dirname, "sessions");
if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir);

// Health check
app.get("/", (req, res) => {
  res.send("LANEZTECH MD SERVER RUNNING ⚡");
});

// STATUS API
app.get("/api/status", (req, res) => {
  const sessions = fs.readdirSync(sessionsDir).length;

  res.json({
    status: "online",
    uptime: process.uptime(),
    sessions
  });
});

// PAIRING API (SAFE VERSION)
app.post("/api/pair", async (req, res) => {
  try {
    const { number } = req.body;

    if (!number) {
      return res.json({ success: false, message: "Number required" });
    }

    const clean = number.replace(/\D/g, "");

    if (clean.length < 10) {
      return res.json({ success: false, message: "Invalid number" });
    }

    // fake pairing code generator (replace later with Baileys)
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    // save session
    fs.writeFileSync(
      path.join(sessionsDir, `${clean}.json`),
      JSON.stringify({
        number: clean,
        code,
        time: Date.now()
      }, null, 2)
    );

    res.json({
      success: true,
      code
    });

  } catch (err) {
    console.log("PAIR ERROR:", err);
    res.json({ success: false, message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
