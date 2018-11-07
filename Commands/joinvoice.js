const voiceHandler = require("../voicehandler.js");
const permHandler = require("../permhandler.js");

module.exports = {
    name: "join",
    Permissions: permHandler.Permissions.USER,
    args: "",
    aliases: [],
    execute: (bot, msg, args) => {
        var voiceid = msg.member.voiceChannelID;
        if (voiceid) {
            voiceHandler.joinChannel(bot, msg, voiceid);
        }
        else {
            msg.channel.send("You must first join a voicechannel!");
        }
    }
}