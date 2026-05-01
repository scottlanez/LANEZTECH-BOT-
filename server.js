const { createPairingCode } = require('./pair');

app.post('/api/pair', async (req, res) => {
  const { number } = req.body;

  if (!number) {
    return res.json({ success: false, message: 'Number required' });
  }

  try {
    const userId = number.replace(/\D/g, '');

    const code = await createPairingCode(userId);

    res.json({
      success: true,
      code
    });

  } catch (err) {
    console.log('PAIR ERROR:', err);

    res.json({
      success: false,
      message: 'Failed to generate pairing code'
    });
  }
});
