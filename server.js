const express = require('express');
const path = require('path');
const { createPairingCode } = require('./pair');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== HOME =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ===== PAIR ROUTE (FIXED) =====
app.post('/api/pair', async (req, res) => {
  try {
    const { number } = req.body;

    if (!number) {
      return res.json({ success: false, message: 'Number required' });
    }

    const userId = number.replace(/\D/g, '');

    const code = await createPairingCode(userId);

    return res.json({
      success: true,
      code
    });

  } catch (err) {
    console.log('PAIR ERROR:', err);

    return res.json({
      success: false,
      message: 'Pairing failed'
    });
  }
});

// ===== STATUS =====
app.get('/api/status/:id', (req, res) => {
  res.json({ online: false });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`
🚀 LANEZTECH SERVER RUNNING
🌍 Port: ${PORT}
  `);
});
