const express = require("express")
const fs = require("fs")
const path = require("path")

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys")

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.static("public"))

const SESSION_DIR = "./auth_info"

let sock

// 🧠 Logger
function log(msg) {
  console.log(`[LANEZTECH] ${msg}`)
}

// 🚀 Start Bot
async function startBot() {
  try {
    if (!fs.existsSync(SESSION_DIR)) {
      fs.mkdirSync(SESSION_DIR)
    }

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update

      if (connection === "connecting") {
        log("🔄 Connecting to WhatsApp...")
      }

      if (connection === "open") {
        log("✅ Connected successfully")
      }

      if (connection === "close") {
        const reason = lastDisconnect?.error?.output?.statusCode

        log("❌ Disconnected: " + reason)

        if (reason !== DisconnectReason.loggedOut) {
          log("🔁 Reconnecting...")
          startBot()
        } else {
          log("🚫 Logged out. Delete session to re-pair.")
        }
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

      log("📩 " + text)

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
    log("💥 Error: " + err.message)
    setTimeout(startBot, 5000)
  }
}

startBot()

// 🔥 Pairing API (YOUR WEBSITE USES THIS)
app.post("/pair", async (req, res) => {
  const number = req.body.number

  if (!number) {
    return res.json({ error: "Enter number" })
  }

  try {
    const code = await sock.requestPairingCode(number)
    log("🔥 Pairing code for " + number + ": " + code)
    res.json({ code })
  } catch (err) {
    res.json({ error: "Failed to generate code" })
  }
})

// 🌐 Health check
app.get("/", (req, res) => {
  res.send("LANEZTECH BOT ONLINE ✅")
})

// 🚀 Start server
app.listen(PORT, () => {
  log("🌐 Server running on port " + PORT)
})
