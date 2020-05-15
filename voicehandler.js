const logHandler = require("./loghandler.js");
const fs = require("fs");
const ytdl = require("ytdl-core");


const Duplex = require('stream').Duplex;

class VoiceHandler {
    constructor() {
        this.voiceConnections = [];
    }

    joinChannel(bot, msg, channelId) {
        bot.channels.fetch(channelId)
            .then((vc, err) => {
                if (vc) {
                    if (this.voiceConnections.findIndex((e) => { return e.channel.guild.id == vc.guild.id }) == -1) {
                        if (vc.joinable) {
                            vc.join().then((voiceconnection) => {
                                voiceconnection.queue = [];
                                this.voiceConnections.push(voiceconnection);
                                logHandler.warning("Joined voice channel! (" + vc.name + ")");
                            }).catch((err) => {
                                logHandler.error(err.message);
                                msg.channel.send("I couldn't join your voicechannel!");
                            });
                        }
                    }
                    else {
                        msg.channel.send("I'm already in a voicechannel on this server, you must first make me leave it.");
                    }
                }
                else {
                    logHandler.error(err.message);
                    msg.channel.send("I couldn't join your voicechannel!");
                }
            });
    }

    leaveChannel(bot, msg, channelId) {
        var index = this.voiceConnections.findIndex((e) => { return e.channel.id == channelId });
        if (index > -1) {
            if (this.voiceConnections[index].dispatcher) this.voiceConnections[index].dispatcher.end("dc");
            this.voiceConnections[index].disconnect();
            logHandler.warning("Left voice channel! (" + this.voiceConnections[index].channel.name + ")");
            this.voiceConnections.splice(index, 1);
        }
    }

    youTube(bot, msg, channelId, ytUrl) {
        var voice = this.voiceConnections.find((e) => { return e.channel.id == channelId });
        if (voice) {
            if (ytdl.validateURL(ytUrl)) {
                voice.queue.push({ type: "youtube", url: ytUrl });
                ytdl.getBasicInfo(ytUrl, (err, info) => {
                    if (err) {
                        logHandler.error(err.message);
                    }
                    if (voice.queue.length == 1) {
                        msg.channel.send(`Playing \`${info.title}\`.`);
                        this.playNext(voice.channel.id);
                    }
                    else {
                        msg.channel.send(`Added \`${info.title}\` to the queue.`);
                    }
                    if (msg.deletable) {
                        msg.delete();
                    }
                });
            }
            else {
                msg.channel.send("The requested URL is invalid.");
            }
        }
    }

    playNext(channelId, isSkip) {
        var voice = this.voiceConnections.find((e) => { return e.channel.id == channelId });
        if (voice) {
            if (voice.queue.length > 0) {
                if (isSkip) {
                    voice.queue.splice(0, 1);
                }
                var next = voice.queue[0];
                var stream = ytdl(next.url, { filter: 'audioonly' });
                voice.play(stream);
                voice.dispatcher.on("finish", (reason) => {
                    if (reason !== "dc") {
                        voice.queue.splice(0, 1);
                        this.playNext(voice.channel.id);
                    }
                });
            }
        }
    }

}


module.exports = new VoiceHandler();