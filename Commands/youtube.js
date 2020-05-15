const voiceHandler = require("../voicehandler.js");
const permHandler = require("../permhandler.js");

module.exports = {
    name: "youtube",
    Permissions: permHandler.Permissions.USER,
    args: "<YouTubeURL>",
    aliases: ["yt"],
    execute: (bot, msg, args) => {
        var voiceid = msg.member.voice.channelID;
        if (voiceid) {
            if (bot.voiceHandler.voiceConnections.findIndex((v) => { return v.channel.id == voiceid }) > -1) {
                voiceHandler.youTube(bot, msg, voiceid, args[0]);
            }
            else {
                msg.channel.send("I'm not in the same voicechannel as you! If I even joined one...");
            }
        }
    }
};