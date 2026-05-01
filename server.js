const express = require('express');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const SECRET = "laneztech-secret"; // change this later

// 👤 ADMIN LOGIN (you control this)
const ADMIN = {
  username: "admin",
  password: "1234" // CHANGE THIS ASAP
};

// 🔐 LOGIN ROUTE
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN.username && password === ADMIN.password) {
    const token = jwt.sign({ user: username }, SECRET, { expiresIn: '1d' });

    return res.json({ success: true, token });
  }

  res.json({ success: false, message: "Invalid login" });
});

// 🔒 MIDDLEWARE (protect routes)
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
}

// 🔥 PROTECTED PAIR ROUTE
const { createPairingCode } = require('./pair');

app.post('/api/pair', auth, async (req, res) => {
  const { number } = req.body;

  if (!number) {
    return res.json({ success: false, message: 'Number required' });
  }

  try {
    const userId = number.replace(/\D/g, '');
    const code = await createPairingCode(userId);

    res.json({ success: true, code });

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Pairing failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
