const permHandler = require("../permhandler.js");

module.exports = {
    group: "",
    name: "ping",
    permissions: permHandler.Permissions.USER,
    args: "",
    aliases: [],
    description: "Pongs.",
    execute: (bot, msg, args) => {
        msg.channel.send("Pong!");
    }
}