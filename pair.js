const {
  default: makeWASocket,
  useMultiFileAuthState
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const path = require('path');

const sessions = {};

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

async function createPairingCode(userId) {
  const sock = await getSocket(userId);

  return new Promise((resolve, reject) => {
    let done = false;

    const timeout = setTimeout(() => {
      if (!done) {
        done = true;
        reject('Timeout');
      }
    }, 20000);

    sock.ev.on('connection.update', async (update) => {
      try {
        if (!done) {
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
