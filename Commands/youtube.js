const voiceHandler = require("../voicehandler.js");
const permHandler = require("../permhandler.js");

module.exports = {
    group: "voice",
    name: "youtube",
    permissions: permHandler.Permissions.USER,
    args: "<YouTubeURL>",
    aliases: ["yt"],
    description: "Plays the song in the music channel the bot is in, if the user is in the same channel.",
    execute: (bot, msg, args) => {
        let voiceid = msg.member.voice.channelID;
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