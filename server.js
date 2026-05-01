const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// =========================
// Serve Frontend
// =========================
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =========================
// Fake pairing generator (replace later with Baileys)
// =========================
function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// =========================
// Pair API
// =========================
app.post("/api/pair", async (req, res) => {
  const { number } = req.body;

  if (!number) {
    return res.json({ success: false, message: "Number required" });
  }

  const clean = number.replace(/\D/g, "");

  if (clean.length < 10) {
    return res.json({ success: false, message: "Invalid number" });
  }

  // simulate delay like real system
  setTimeout(() => {
    const code = generateCode();

    return res.json({
      success: true,
      code,
      number: clean
    });
  }, 1500);
});

app.listen(PORT, () => {
  console.log("LANEZTECH MD running on port " + PORT);
});
