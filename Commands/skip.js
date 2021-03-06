const voiceHandler = require("../voicehandler.js");
const permHandler = require("../permhandler.js");

module.exports = {
    group: "voice",
    name: "skip",
    permissions: permHandler.Permissions.USER,
    args: "",
    aliases: [],
    description: "Skips the currently playing song, if the user is in the same voicechannel as the bot",
    execute: (bot, msg, args) => {
        var voiceid = msg.member.voice.channelID;
        if (voiceid) {
            let vindex = voiceHandler.voiceConnections.findIndex((v) => { return v.channel.id == voiceid });
            if (vindex > -1) {
                if (voiceHandler.voiceConnections[vindex].queue.length > 1) {
                voiceHandler.playNext(voiceid, true);
                }
                else {
                    msg.channel.send("There is no next music in the queue! If you wish to stop the music, use \`-leave\`!");
                }
            }
            else {
                msg.channel.send("I'm not in the same voicechannel as you!");
            }
        }
    }
}