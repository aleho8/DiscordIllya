const voiceHandler = require("../voicehandler.js");
const permHandler = require("../permhandler.js");

module.exports = {
    group: "voice",
    name: "leave",
    permissions: permHandler.Permissions.USER,
    args: "",
    aliases: [],
    description: "Leaves the current voicechannel the bot is in, if the user is in the same channel.",
    execute: (bot, msg, args) => {
        var voiceid = msg.member.voice.channelID;
        if (voiceid) {
            if (voiceHandler.voiceConnections.findIndex((v) => { return v.channel.id == voiceid }) > -1) {
                voiceHandler.leaveChannel(bot, msg, voiceid);
            }
            else {
                msg.channel.send("I'm not in the same voicechannel as you! If I even joined one...");
            }
        }
    }
}