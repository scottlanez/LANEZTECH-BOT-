const express = require("express")
const fs = require("fs")

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys")

const app = express()
const PORT = process.env.PORT || 3000

// 🌐 Web server (REQUIRED for Render)
app.get("/", (req, res) => {
  res.send("LANEZTECH BOT RUNNING ✅")
})

app.listen(PORT, () => {
  console.log("🌐 Server running on port " + PORT)
})

// 🤖 Start Bot
async function startBot() {
  try {
    // 🔥 Force fresh session (fix stuck login)
    if (fs.existsSync("./auth_info")) {
      fs.rmSync("./auth_info", { recursive: true, force: true })
    }

    const { state, saveCreds } = await useMultiFileAuthState("auth_info")

    const sock = makeWASocket({
      auth: state
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update

      if (connection === "connecting") {
        console.log("🔄 Connecting to WhatsApp...")

        try {
          const code = await sock.requestPairingCode("256706486353")
          console.log("🔥 YOUR PAIRING CODE:", code)
        } catch (err) {
          console.log("❌ Pairing error:", err.message)
        }
      }

      if (connection === "open") {
        console.log("✅ BOT CONNECTED SUCCESSFULLY")
      }

      if (connection === "close") {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

        console.log("❌ Disconnected. Reconnecting:", shouldReconnect)

        if (shouldReconnect) startBot()
      }
    })

    // 📩 Commands
    sock.ev.on("messages.upsert", async ({ messages }) => {
      const msg = messages[0]
      if (!msg.message) return

      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text

      if (!text) return

      console.log("📩 Message:", text)

      if (text === ".menu") {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `🤖 *LANEZTECH BOT*

.menu
.ping
.owner`
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

  } catch (err) {
    console.log("💥 BOT CRASHED:", err)
  }
}

startBot()
