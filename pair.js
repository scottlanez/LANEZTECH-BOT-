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
    printQRInTerminal: false
  });

  sock.ev.on('creds.update', saveCreds);

  sessions[userId] = sock;

  return sock;
}

module.exports = { startSession, sessions };
