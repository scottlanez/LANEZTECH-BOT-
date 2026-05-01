const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const path = require('path');

const sessions = {};

async function startSession(userId) {
  const sessionPath = path.join(__dirname, 'sessions', userId);

  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

  const sock = makeWASocket({
    auth: state,
    browser: ['LANEZTECH', 'Chrome', '1.0.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sessions[userId] = sock;

  return sock;
}

// ✅ SAFE PAIRING FUNCTION
async function createPairingCode(userId) {
  const sock = await startSession(userId);

  return new Promise((resolve, reject) => {
    let resolved = false;

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'connecting') {
        console.log('🔄 Connecting...');
      }

      if (connection === 'open') {
        console.log('✅ Connected');
      }

      if (connection === 'close') {
        console.log('❌ Closed');

        if (!resolved) {
          reject('Connection closed before pairing');
        }
      }

      // 🔥 THIS IS THE FIX
      if (!resolved) {
        try {
          const code = await sock.requestPairingCode(userId);
          resolved = true;
          resolve(code);
        } catch (err) {
          reject(err);
        }
      }
    });

    // ⛔ safety timeout
    setTimeout(() => {
      if (!resolved) {
        reject('Timeout generating pairing code');
      }
    }, 15000);
  });
}

module.exports = { createPairingCode, sessions };
