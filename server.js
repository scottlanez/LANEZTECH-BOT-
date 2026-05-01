const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== HOME ROUTE =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ===== HEALTH CHECK (IMPORTANT FOR RENDER) =====
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'LANEZTECH server running'
  });
});

// ===== BASIC TEST ROUTE =====
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API working' });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`
🚀 LANEZTECH SERVER ONLINE
🌍 Port: ${PORT}
⚡ Status: RUNNING
  `);
});
