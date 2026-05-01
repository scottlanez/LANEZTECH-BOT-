const express = require('express');
const cors = require('cors');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// simple test route (IMPORTANT for Render)
app.get('/', (req, res) => {
  res.send('LANEZTECH MD SERVER RUNNING 🚀');
});

// pairing route (SAFE VERSION - no external file, no crash)
app.post('/api/pair', async (req, res) => {
  try {
    const { number } = req.body;

    if (!number) {
      return res.json({ success: false, message: 'Number required' });
    }

    // safe generator (no dependencies, no crashes)
    const code = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

    return res.json({
      success: true,
      code
    });

  } catch (err) {
    console.log('PAIR ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// health check (Render likes this)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// IMPORTANT: must use Render PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`LANEZTECH MD running on port ${PORT}`);
});
