const express = require("express")
const app = express()

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys")

const PORT = process.env.PORT || 3000

// ✅ Web server (REQUIRED for Render)
app.get("/", (req, res) => {
  res.send("LANEZTECH BOT IS RUNNING ✅")
})

app.listen(PORT, () => {
  console.log("🌐 Server running on port " + PORT)
})

// ✅ WhatsApp Bot
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session")

  const sock = makeWASocket({
    auth: state
  })

  // Pairing Code (NO QR)
  const phoneNumber = "256706486353"

  if (!sock.authState.creds.registered) {
    const code = await sock.requestPairingCode(phoneNumber)
    console.log("🔥 YOUR PAIRING CODE:", code)
  }

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

      console.log("❌ Disconnected. Reconnecting:", shouldReconnect)

      if (shouldReconnect) startBot()
    } else if (connection === "open") {
      console.log("✅ BOT CONNECTED SUCCESSFULLY")
    }
  })

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text

    if (text === ".menu") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "🤖 LANEZTECH BOT\n\n.menu\n.ping\n.owner"
      })
    }

    if (text === ".ping") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "🏓 Pong!"
      })
    }

    if (text === ".owner") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "👑 Owner: LANEZTECH"
      })
    }
  })
}

startBot()
