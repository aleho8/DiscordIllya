const voiceHandler = require("../voicehandler.js");
const permHandler = require("../permhandler.js");

module.exports = {
    name: "leave",
    Permissions: permHandler.Permissions.USER,
    args: "",
    aliases: [],
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