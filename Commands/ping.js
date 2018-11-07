const permHandler = require("../permhandler.js");

module.exports = {
    name: "ping",
    Permissions: permHandler.Permissions.USER,
    args: "",
    aliases: [],
    execute: (bot, msg, args) => {
        msg.channel.send("Pong!");
    }
}