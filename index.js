const express = require("express")
const fs = require("fs")

const {
  default: makeWASocket,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys")

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.static("public"))

let sock

// 🚀 Start bot
async function startBot() {
  if (fs.existsSync("./auth_info")) {
    fs.rmSync("./auth_info", { recursive: true, force: true })
  }

  const { state, saveCreds } = await useMultiFileAuthState("auth_info")

  sock = makeWASocket({
    auth: state
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (update) => {
    if (update.connection === "open") {
      console.log("✅ BOT CONNECTED")
    }
  })
}

startBot()

// 🔥 API to generate pairing code
app.post("/pair", async (req, res) => {
  const number = req.body.number

  if (!number) {
    return res.json({ error: "Enter number" })
  }

  try {
    const code = await sock.requestPairingCode(number)
    res.json({ code })
  } catch (err) {
    res.json({ error: "Failed to generate code" })
  }
})

// 🌐 Start server
app.listen(PORT, () => {
  console.log("🌐 Website running on port " + PORT)
})
