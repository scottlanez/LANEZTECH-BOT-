const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const fs = require("fs");

async function startBot(sessionId, onStatus) {
  const { state, saveCreds } = await useMultiFileAuthState(`sessions/${sessionId}`);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      onStatus("connected");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason !== DisconnectReason.loggedOut) {
        startBot(sessionId, onStatus);
      }

      onStatus("disconnected");
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}

module.exports = { startBot };
