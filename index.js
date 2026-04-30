const { spawn } = require("child_process");

console.log("🚀 LANEZTECH BOT STARTING...");

function startBot() {
    const bot = spawn("node", ["bot.js"], {
        stdio: "inherit"
    });

    bot.on("close", (code) => {
        console.log(`⚠️ Bot stopped (${code}), restarting...`);
        setTimeout(startBot, 5000);
    });

    bot.on("error", (err) => {
        console.log("❌ Error:", err.message);
    });
}

startBot();
