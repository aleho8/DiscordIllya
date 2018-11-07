const Discord = require("discord.js");
const client = new Discord.Client();

const commandHandler = require("./commandhandler.js");
const logHandler = require("./loghandler.js");

commandHandler.readCommands(() => {
    client.login("lazytochangeyet");
    logHandler.warning("Logged in!");
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

