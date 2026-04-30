// ============================================================
//              LANEZTECH MD - CORE LAUNCHER
//              Clean Stable Architecture
// ============================================================

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { spawn } = require('child_process');
const moment = require('moment-timezone');

const BOT_NAME = 'LANEZTECH MD';
const MAIN_FILE = 'bot.js';
const TIMEZONE = 'Africa/Kampala';
const BOT_DIR = __dirname;

// ================= LOGGING =================
function time() {
  return moment().tz(TIMEZONE).format('HH:mm:ss DD/MM/YYYY');
}

function log(msg) {
  console.log(`[${time()}] [${BOT_NAME}] ${msg}`);
}

// ================= PLATFORM =================
function platform() {
  if (process.env.RENDER) return 'Render';
  if (process.env.DYNO) return 'Heroku';
  if (process.env.RAILWAY_ENVIRONMENT) return 'Railway';
  return 'Local/VPS';
}

// ================= START BOT =================
function startBot() {
  const file = path.join(BOT_DIR, MAIN_FILE);

  if (!fs.existsSync(file)) {
    log('❌ bot.js not found. Cannot start system.');
    return;
  }

  log(`🚀 Starting LANEZTECH MD on ${platform()}`);

  const bot = spawn('node', ['bot.js'], {
    cwd: BOT_DIR,
    stdio: 'inherit',
    shell: true
  });

  bot.on('close', (code) => {
    log(`⚠ Bot stopped with code ${code}`);

    setTimeout(() => {
      log('♻ Restarting system...');
      startBot();
    }, 4000);
  });

  bot.on('error', (err) => {
    log(`❌ Error: ${err.message}`);
  });
}

// ================= BOOT =================
function init() {
  console.log(`
╔══════════════════════════════╗
║       ⚡ LANEZTECH MD        ║
║   WhatsApp Automation Core   ║
╚══════════════════════════════╝
`);

  startBot();
}

init();
