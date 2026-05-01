const express = require('express');
const path = require('path');
const { startSession, sessions } = require('./pair');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== HOME =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ===== PAIR ROUTE =====
app.post('/api/pair', async (req, res) => {
  const { number } = req.body;

  if (!number) {
    return res.json({ success: false, message: 'Number required' });
  }

  try {
    const userId = number.replace(/\D/g, '');

    const sock = await startSession(userId);

    const code = await sock.requestPairingCode(userId);

    res.json({
      success: true,
      code
    });

  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      message: 'Pairing failed'
    });
  }
});

// ===== STATUS =====
app.get('/api/status/:id', (req, res) => {
  const id = req.params.id;

  if (sessions[id]) {
    res.json({ online: true });
  } else {
    res.json({ online: false });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});
