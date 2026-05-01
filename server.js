const express = require("express");
const path = require("path");
const { startBot } = require("./bot");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// start WhatsApp bot
startBot();

// pairing endpoint (basic control hook)
app.post("/api/pair", (req, res) => {
    const { number } = req.body;

    if (!number) {
        return res.json({ success: false, message: "Number required" });
    }

    // real pairing handled by Baileys (QR in terminal)
    res.json({
        success: true,
        message: "Check terminal for QR / pairing"
    });
});

// health check
app.get("/", (req, res) => {
    res.send("LANEZTECH MD Server Running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
