const express = require('express');
const cors = require('cors');

const app = express();

// ===== CORE =====
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const startTime = Date.now();
let totalRequests = 0;

// ===== HOME =====
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// ===== PAIR =====
app.post('/api/pair', (req, res) => {
  totalRequests++;

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

  return res.json({
    success: true,
    code
  });
});

// ===== STATS =====
app.get('/api/stats', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  res.json({
    uptime,
    requests: totalRequests,
    status: "online"
  });
});

// ===== HEALTH =====
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// ===== START =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("LANEZTECH MD RUNNING ON PORT " + PORT);
});
