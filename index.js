const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const P = require("pino");

async function startBot() {
    console.log("Starting LANEZTECH BOT...");

    const { state, saveCreds } = await useMultiFileAuthState("./session");

    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: P({ level: "silent" })
    });

    // SAVE SESSION
    sock.ev.on("creds.update", saveCreds);

    // CONNECTION HANDLER
    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "open") {
            console.log("✅ LANEZTECH BOT ONLINE 🚀");
        }

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            console.log("❌ Disconnected. Reconnecting:", shouldReconnect);

            if (shouldReconnect) startBot();
        }
    });

    // 📲 PAIRING CODE LOGIN (FIRST TIME ONLY)
    if (!sock.authState.creds.registered) {
        try {
            const phoneNumber = "256706486353";
            const code = await sock.requestPairingCode(phoneNumber);
            console.log("================================");
            console.log("PAIRING CODE:", code);
            console.log("================================");
        } catch (err) {
            console.log("Pairing error:", err);
        }
    }

    // MESSAGE HANDLER
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        const from = msg.key.remoteJid;

        if (!text) return;

        if (text.toLowerCase() === "ping") {
            await sock.sendMessage(from, { text: "pong ✅" });
        }

        if (text.toLowerCase() === "hi") {
            await sock.sendMessage(from, { text: "Hello from LANEZTECH 🚀" });
        }
    });
}

startBot();
