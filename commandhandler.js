const fs = require("fs");
const permHandler = require("./permhandler.js");
const logHandler = require("./loghandler.js");

class CommandHandler {
    constructor() {
        this.prefix = "-";
        this.commands = [];
        this.executeCommand = executeCommand;
        this.readCommands = readCommands;
    }
}

function executeCommand(bot, msg) {
    msg.content = msg.content.trim();

    var results = msg.content.replace(/\s+/g, " ").split(/\s/g);
    var commandname = results[0].replace(this.prefix, "");
    var command = this.commands.find((c) => {
        return c.name === commandname || (c.aliases.findIndex((a) => { return a === commandname }) > -1);
    });
    results.splice(0,1);
    var args = results;
    if (command) {
        if (command.args != "" && args.length == 0) {
            msg.channel.send(`You missed a few arguments! Use \`${this.prefix}help\`!`);
        }
        else {
            command.execute(bot, msg, args);
        }
    }
}

function readCommands(callback) {
    fs.readdir("./commands/", (err, files) => {
        if (err) logHandler.error(err);
        for (var i = 0; i < files.length; i++) {
            this.commands[this.commands.length] = require("./commands/" + files[i]);
        }
        callback();
    });
}

module.exports = new CommandHandler();