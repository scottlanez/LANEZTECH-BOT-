const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const P = require("pino");

let sock;

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./sessions");

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: P({ level: "silent" }),
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === "open") {
            console.log("✅ WhatsApp Bot Connected");
        }
    });

    // simple commands
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        if (!text) return;

        if (text === ".ping") {
            await sock.sendMessage(msg.key.remoteJid, { text: "Pong ⚡" });
        }

        if (text === ".alive") {
            await sock.sendMessage(msg.key.remoteJid, { text: "LANEZTECH MD is Alive 🔥" });
        }
    });
}

module.exports = { startBot };
