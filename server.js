const { createPairingCode, sessions } = require('./pair');

// ===== PAIR ROUTE =====
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

// ===== SESSION CHECK =====
app.get('/api/session/:id', (req, res) => {
  const id = req.params.id;

  if (sessions[id]) {
    return res.json({ status: 'active' });
  }

  return res.json({ status: 'inactive' });
});
