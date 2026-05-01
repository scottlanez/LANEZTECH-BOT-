const express = require('express');
const path = require('path');

const app = express();

// ===== CONFIG =====
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== TEMP STORAGE (later we upgrade to real sessions) =====
let pairingData = {
  number: null,
  code: null,
  status: 'idle'
};

// ===== ROUTES =====

// Home (your dashboard)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Generate pairing code
app.post('/api/pair', (req, res) => {
  const { number } = req.body;

  if (!number) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }

  // fake code for now (we connect real bot later)
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  pairingData = {
    number,
    code,
    status: 'generated'
  };

  console.log('New Pair Request:', pairingData);

  res.json({
    success: true,
    code,
    number
  });
});

// Check status
app.get('/api/status', (req, res) => {
  res.json(pairingData);
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`
⚡ LANEZTECH SERVER RUNNING
🌍 Port: ${PORT}
🚀 Status: ACTIVE
  `);
});
