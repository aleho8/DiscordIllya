const voiceHandler = require("../voicehandler.js");
const permHandler = require("../permhandler.js");

module.exports = {
    name: "beep",
    Permissions: permHandler.Permissions.USER,
    args: "<BeepBoxString>",
    aliases: ["beepbox"],
    execute: (bot, msg, args) => {
        var voiceid = msg.member.voiceChannelID;
        if (voiceid) {
            if (bot.voiceConnections.array().findIndex((v) => { return v.channel.id == voiceid }) > -1) {
                voiceHandler.beepBox(bot, msg, voiceid, args[0]);
            }
            else {
                msg.channel.send("I'm not in the same voicechannel as you! If I even joined one...");
            }
        }
    }
}