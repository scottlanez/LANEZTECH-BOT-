// ============================================================
//            LANEZTECH BOT - ADVANCED LAUNCHER
// ============================================================

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');
const { spawn } = require('child_process');
const moment = require('moment-timezone');

// ===== SETTINGS =====
const BOT_NAME = 'LANEZTECH';
const MAIN_FILE = 'index.js'; // your bot main file
const BOT_ZIP = 'bot.zip';
const TIMEZONE = 'Africa/Kampala';
const BOT_DIR = __dirname;

// ✅ YOUR GITHUB ZIP LINK
const DOWNLOAD_URL = 'https://github.com/scottlanez/LANEZTECH-BOT-/archive/refs/heads/main.zip';

// Files NOT to overwrite
const KEEP_FILES = [
  'node_modules',
  'session',
  '.env',
  'index.js'
];

// ===== LOGGER =====
function log(msg, type = "INFO") {
  const time = moment().tz(TIMEZONE).format('HH:mm:ss');
  console.log(`[${time}] [${type}] ${msg}`);
}

// ===== DOWNLOAD BOT =====
async function downloadBot() {
  const zipPath = path.join(BOT_DIR, BOT_ZIP);

  log('Downloading bot from GitHub...');

  const response = await axios({
    url: DOWNLOAD_URL,
    method: 'GET',
    responseType: 'arraybuffer'
  });

  fs.writeFileSync(zipPath, response.data);
  log('Download complete ✅');

  return zipPath;
}

// ===== EXTRACT =====
function extractBot(zipPath) {
  log('Extracting files...');

  const zip = new AdmZip(zipPath);

  zip.getEntries().forEach(entry => {
    let entryName = entry.entryName;

    // 🔥 Remove GitHub root folder (important fix)
    if (entryName.includes('/')) {
      entryName = entryName.split('/').slice(1).join('/');
    }

    if (!entryName) return;

    const filePath = path.join(BOT_DIR, entryName);

    // Skip protected files
    if (KEEP_FILES.some(f => entryName.startsWith(f))) return;

    if (entry.isDirectory) {
      fs.mkdirSync(filePath, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, entry.getData());
    }
  });

  fs.unlinkSync(zipPath);
  log('Extraction complete ✅');
}

// ===== INSTALL =====
function installDeps() {
  return new Promise((resolve, reject) => {
    log('Installing dependencies...');

    const npm = spawn('npm', ['install', '--omit=dev'], {
      cwd: BOT_DIR,
      stdio: 'inherit'
    });

    npm.on('close', code => {
      if (code === 0) {
        log('Dependencies installed ✅');
        resolve();
      } else {
        reject(new Error('npm install failed'));
      }
    });
  });
}

// ===== START BOT =====
function startBot() {
  const file = path.join(BOT_DIR, MAIN_FILE);

  if (!fs.existsSync(file)) {
    log('Main bot file missing ❌', 'ERROR');
    process.exit(1);
  }

  log('Starting bot... 🚀');

  const bot = spawn('node', [MAIN_FILE], {
    cwd: BOT_DIR,
    stdio: 'inherit'
  });

  bot.on('close', code => {
    log(`Bot stopped (code ${code}). Restarting in 5s...`, 'WARN');
    setTimeout(startBot, 5000);
  });

  bot.on('error', err => {
    log(`Bot error: ${err.message}`, 'ERROR');
  });
}

// ===== INIT =====
async function init() {
  console.log(`
╔══════════════════════════════════════╗
║         LANEZTECH LAUNCHER           ║
║        Fast • Clean • Stable         ║
╚══════════════════════════════════════╝
`);

  try {
    if (!fs.existsSync(path.join(BOT_DIR, MAIN_FILE))) {
      log('Bot not found. Setting up...');

      const zip = await downloadBot();
      extractBot(zip);
      await installDeps();
    } else {
      log('Bot already installed ✅');
    }

    startBot();

  } catch (err) {
    log(`Fatal error: ${err.message}`, 'ERROR');
    log('Retrying in 10 seconds...');
    setTimeout(init, 10000);
  }
}

// ===== START =====
init();
