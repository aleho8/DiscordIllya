const Discord = require("discord.js");
const client = new Discord.Client();

const commandHandler = require("./commandhandler.js");
const logHandler = require("./loghandler.js");
const configHandler = require("./confighandler.js");


configHandler.readConfig(() => {
    commandHandler.readCommands(() => {
        client.login(configHandler.discordToken)
            .then(() => {
                logHandler.warning("Logged in!");
            })
            .catch((err) => {
                logHandler.error(err);
                logHandler.warning("Restarting...");
                setTimeout(() => {
                    process.exit(66);
                }, 3000);
            });
    });
});

client.on("message", (msg) => {
    logHandler.logDiscordMessage(msg);

    if (msg.content.startsWith(commandHandler.prefix)) {
        commandHandler.executeCommand(client, msg);
    }
});

client.on("error", (err) => {
    logHandler.error(err.message);
});

process.on("uncaughtException", (err) => {
    logHandler.error(err.message);
    logHandler.warning("Restarting...");
    setTimeout(() => {
        process.exit(66);
    }, 3000);
});
