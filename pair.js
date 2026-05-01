const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const path = require('path');

const sessions = {};

// ===== CREATE SESSION =====
async function startSession(userId) {
  const sessionPath = path.join(__dirname, 'sessions', userId);

  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ['LANEZTECH', 'Chrome', '1.0.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sessions[userId] = sock;

  return sock;
}

// ===== WAIT UNTIL SOCKET IS READY =====
function waitForConnection(sock) {
  return new Promise((resolve, reject) => {
    let done = false;

    const timeout = setTimeout(() => {
      if (!done) {
        done = true;
        reject('Connection timeout');
      }
    }, 20000);

    sock.ev.on('connection.update', (update) => {
      const { connection } = update;

      if (connection === 'open' && !done) {
        done = true;
        clearTimeout(timeout);
        resolve(true);
      }

      if (connection === 'close' && !done) {
        done = true;
        clearTimeout(timeout);
        reject('Connection closed');
      }
    });
  });
}

// ===== MAIN PAIRING FUNCTION =====
async function createPairingCode(userId) {
  const sock = await startSession(userId);

  try {
    // wait until WhatsApp socket is fully ready
    await waitForConnection(sock);

    // now safe to request pairing code
    const code = await sock.requestPairingCode(userId);

    return code;

  } catch (err) {
    console.log('PAIR ERROR:', err);
    throw err;
  }
}

module.exports = {
  createPairingCode,
  sessions
};
