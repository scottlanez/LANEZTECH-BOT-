const express = require("express")
const app = express()

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys")

const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
  res.send("LANEZTECH BOT RUNNING ✅")
})

app.listen(PORT, () => {
  console.log("Server running on port", PORT)
})

async function startBot() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("session")

    const sock = makeWASocket({
      auth: state
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update

      if (connection === "close") {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

        console.log("Disconnected:", shouldReconnect)

        if (shouldReconnect) startBot()
      }

      if (connection === "open") {
        console.log("✅ BOT CONNECTED")
      }

      // ✅ Only request pairing AFTER connection starts
      if (connection === "connecting") {
        const phoneNumber = "256706486353"
        try {
          const code = await sock.requestPairingCode(phoneNumber)
          console.log("🔥 PAIR CODE:", code)
        } catch (err) {
          console.log("Pairing error:", err.message)
        }
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
          text: "🤖 LANEZTECH BOT\n.menu\n.ping\n.owner"
        })
      }

      if (text === ".ping") {
        await sock.sendMessage(msg.key.remoteJid, {
          text: "🏓 Pong!"
        })
      }
    })

  } catch (err) {
    console.log("❌ BOT CRASH:", err)
  }
}

startBot()
