const express = require('express');
const path = require('path');

const { createPairingCode, sessions } = require('./pair');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== START TIME (for uptime) =====
const startTime = Date.now();

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== STATE =====
let pairingState = {
  status: 'idle',
  number: null,
  code: null
};

// ===== HOME =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ===== PAIR API =====
app.post('/api/pair', async (req, res) => {
  try {
    const { number } = req.body;

    if (!number) {
      return res.json({
        success: false,
        message: 'Number required'
      });
    }

    const userId = number.replace(/\D/g, '');

    pairingState.status = 'connecting';
    pairingState.number = userId;

    const code = await createPairingCode(userId);

    pairingState.status = 'paired';
    pairingState.code = code;

    return res.json({
      success: true,
      code
    });

  } catch (err) {
    console.log('PAIR ERROR:', err);

    pairingState.status = 'failed';

    return res.json({
      success: false,
      message: 'Pairing failed'
    });
  }
});

// ===== LIVE STATE =====
app.get('/api/state', (req, res) => {
  res.json(pairingState);
});

// ===== STATS API (UPTIME + SESSIONS) =====
app.get('/api/stats', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  res.json({
    uptime,
    sessions: Object.keys(sessions).length,
    status: 'online'
  });
});

// ===== SESSION CHECK =====
app.get('/api/session/:id', (req, res) => {
  const id = req.params.id;

  if (sessions[id]) {
    return res.json({ status: 'active' });
  }

  return res.json({ status: 'inactive' });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`
⚡ LANEZTECH MD SERVER RUNNING
🌐 Port: ${PORT}
🚀 Status: ONLINE
  `);
});
