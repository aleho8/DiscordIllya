const c = require("chalk");

class LogHandler {
    constructor() {
        this.error = (msg) => {
            console.log(c.red.bold("[ " + new Date(Date.now()).toLocaleTimeString() + " ] " + msg));
        };
        this.warning = (msg) => {
            console.log(c.yellow.bold("[ " + new Date(Date.now()).toLocaleTimeString() + " ] " + msg));
        };
        this.log = (msg) => {
            console.log("[ " + new Date(Date.now()).toLocaleTimeString() + " ] " + msg);
        };
        this.logDiscordMessage = (dmsg) => {
            if (dmsg.guild !== null) {
                console.log("discord");
                console.log("[ " + dmsg.createdAt.toLocaleTimeString() + " ]" + "/[ " + dmsg.guild.name + "/#" + dmsg.channel.name + " ] " + dmsg.author.tag + ": " + dmsg.content);
            }
            else {
                console.log("[ " + dmsg.createdAt.toLocaleTimeString() + " ]" + "/[ DM ] " + dmsg.author.tag + ": " + dmsg.content);
            }
        };
    }
}



module.exports = new LogHandler();
