const voiceHandler = require("../voicehandler.js");
const permHandler = require("../permhandler.js");

module.exports = {
    group: "voice",
    name: "join",
    permissions: permHandler.Permissions.USER,
    args: "",
    aliases: [],
    description: "Makes the bot join the same voicechannel as the user, if the user is in any.",
    execute: (bot, msg, args) => {
        let voiceid = msg.member.voice.channelID;
        if (voiceid) {
            voiceHandler.joinChannel(bot, msg, voiceid);
        }
        else {
            msg.channel.send("You must first join a voicechannel!");
        }
    }
}