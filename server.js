const express = require("express");
const app = express();
const path = require("path");

app.use(express.json());
app.use(express.static("public"));

// HOME PAGE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// PAIR ROUTE (SAFE TEST VERSION)
app.get("/pair", (req, res) => {
  const number = req.query.number;

  if (!number) {
    return res.status(400).json({
      status: false,
      message: "Number required"
    });
  }

  const code = "LANEZ-" + Math.floor(100000 + Math.random() * 900000);

  res.json({
    status: true,
    number,
    pairingCode: code
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
