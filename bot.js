const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const P = require("pino");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" })
    });

    // 🔥 PAIRING CODE (NO QR)
    if (!sock.authState.creds.registered) {
        const phone = "256706486353"; // your number
        const code = await sock.requestPairingCode(phone);
        console.log("🔥 YOUR PAIRING CODE:", code);
    }

    // Save session
    sock.ev.on("creds.update", saveCreds);

    // Connection updates
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;

            console.log("❌ Disconnected:", reason);

            if (reason !== DisconnectReason.loggedOut) {
                startBot(); // reconnect
            }
        } else if (connection === "open") {
            console.log("✅ BOT CONNECTED SUCCESSFULLY");
        }
    });

    // Simple command system
    sock.ev.on("messages.upsert", async (msg) => {
        const m = msg.messages[0];
        if (!m.message) return;

        const text = m.message.conversation || m.message.extendedTextMessage?.text;

        if (text === ".menu") {
            await sock.sendMessage(m.key.remoteJid, {
                text: "🔥 LANEZTECH BOT MENU 🔥\n\n.menu\n.ping\n.owner"
            });
        }

        if (text === ".ping") {
            await sock.sendMessage(m.key.remoteJid, {
                text: "🏓 Pong!"
            });
        }

        if (text === ".owner") {
            await sock.sendMessage(m.key.remoteJid, {
                text: "👑 Owner: LANEZTECH"
            });
        }
    });
}

startBot();
