// ============================================================
//              ⚡ LANEZTECH MD LAUNCHER
//        WhatsApp Automation System (Stable Core)
// ============================================================

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const moment = require('moment-timezone');

// ================= CONFIG =================
const BOT_NAME = 'LANEZTECH MD';
const MAIN_FILE = 'bot.js';
const TIMEZONE = 'Africa/Kampala';
const BOT_DIR = __dirname;

// ================= TIME =================
function time() {
  return moment().tz(TIMEZONE).format('HH:mm:ss DD/MM/YYYY');
}

// ================= PLATFORM =================
function platform() {
  if (process.env.RENDER) return 'Render';
  if (process.env.DYNO) return 'Heroku';
  if (process.env.RAILWAY_ENVIRONMENT) return 'Railway';
  if (process.env.KOYEB_APP_ID) return 'Koyeb';
  return 'VPS / Local';
}

// ================= BANNER =================
function banner() {
  const p = platform();

  console.log(`
╔══════════════════════════════════════╗
║          ⚡ LANEZTECH MD             ║
║      WhatsApp Automation System      ║
║                                      ║
║   Created by LANEZTECH DEV TEAM      ║
║   Status: ONLINE                     ║
║   Platform: ${p.padEnd(20)} ║
╚══════════════════════════════════════╝
`);
}

// ================= LOG =================
function log(msg) {
  console.log(`[${time()}] [${BOT_NAME}] ${msg}`);
}

// ================= START BOT =================
function startBot() {
  const file = path.join(BOT_DIR, MAIN_FILE);

  if (!fs.existsSync(file)) {
    log('❌ bot.js not found. Cannot start system.');
    return;
  }

  log('🚀 Starting bot engine...');

  const bot = spawn('node', [MAIN_FILE], {
    cwd: BOT_DIR,
    stdio: 'inherit',
    shell: true
  });

  bot.on('close', (code) => {
    log(`⚠ Bot stopped (code: ${code})`);

    log('♻ Restarting in 4 seconds...');
    setTimeout(startBot, 4000);
  });

  bot.on('error', (err) => {
    log('❌ Error: ' + err.message);
  });
}

// ================= INIT =================
function init() {
  banner();

  log('System booting up...');
  log('Checking environment...');

  setTimeout(() => {
    startBot();
  }, 1000);
}

init();
