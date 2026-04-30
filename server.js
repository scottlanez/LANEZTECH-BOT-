const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static("public"));

// pairing API route (safe)
app.get("/pair", async (req, res) => {
    const number = req.query.number;

    if (!number) {
        return res.json({ status: false, message: "Number required" });
    }

    // simulate pairing code (we connect real bot later safely)
    const code = "LANEZ-" + Math.floor(Math.random() * 999999);

    return res.json({
        status: true,
        number,
        code
    });
});

// homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
