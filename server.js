const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ROOT
app.get('/', (req, res) => {
  res.send('LANEZTECH MD ONLINE 🚀');
});

// PAIR ROUTE (NO CRASH VERSION)
app.post('/api/pair', (req, res) => {
  const { number } = req.body || {};

  if (!number) {
    return res.json({
      success: false,
      message: "Number required"
    });
  }

  const code = Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase();

  res.json({
    success: true,
    code
  });
});

// HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// IMPORTANT FOR RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("LANEZTECH running on port " + PORT);
});
