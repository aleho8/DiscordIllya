const fs = require("fs");
const permHandler = require("./permhandler.js");
const logHandler = require("./loghandler.js");

class CommandHandler {
    constructor() {
        this.prefix = "-";
        this.commands = [];
    }

    executeCommand(bot, msg) {
        msg.content = msg.content.trim();

        let results = msg.content.replace(/\s+/g, " ").split(/\s/g);
        let commandgroup = results[0].replace(this.prefix, "");
        let commands = this.commands.find(c => c.name === commandgroup && c.group === "") || this.commands.filter(c => c.group === commandgroup);
        if (Array.isArray(commands)) {
            let command = commands.find(c => c.name === results[1] || (c.aliases.findIndex(a => a === results[1]) > -1));
            if (command) {
                results.splice(0, 2);
                let args = results;
                if ((command.args != "" && command.args.indexOf("?") === -1) && args.length == 0) {
                    msg.channel.send(`You missed a few arguments! Use \`${this.prefix}help\`!`);
                }
                else {
                    command.execute(bot, msg, args);
                }
            }
        }
        else if (commands) {
            results.splice(0, 1);
            let args = results;
            if ((commands.args != "" && commands.args.indexOf("?") === -1) && args.length == 0) {
                msg.channel.send(`You missed a few arguments! Use \`${this.prefix}help\`!`);
            }
            else {
                commands.execute(bot, msg, args);
            }
        }

    }

    readCommands(callback) {
        fs.readdir("./commands/", (err, files) => {
            if (err) logHandler.error(err);
            for (let i = 0; i < files.length; i++) {
                this.commands.push(require("./commands/" + files[i]));
            }
            callback();
        });
    }

}


module.exports = new CommandHandler();