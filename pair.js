const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const path = require('path');

const sessions = {};

// ===== CREATE / LOAD SESSION =====
async function getSocket(userId) {
  const sessionPath = path.join(__dirname, 'sessions', userId);

  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ['LANEZTECH', 'Chrome', '1.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sessions[userId] = sock;

  return sock;
}

// ===== PAIRING (SAFE LAZY LOAD) =====
async function createPairingCode(userId) {
  const sock = await getSocket(userId);

  return new Promise((resolve, reject) => {
    let done = false;

    const timeout = setTimeout(() => {
      if (!done) {
        done = true;
        reject('Pairing timeout');
      }
    }, 20000);

    sock.ev.on('connection.update', async (update) => {
      const { connection } = update;

      try {
        if (!done && connection !== 'close') {
          const code = await sock.requestPairingCode(userId);
          done = true;
          clearTimeout(timeout);
          resolve(code);
        }
      } catch (err) {
        if (!done) {
          done = true;
          clearTimeout(timeout);
          reject(err);
        }
      }
    });
  });
}

module.exports = {
  createPairingCode,
  sessions
};
