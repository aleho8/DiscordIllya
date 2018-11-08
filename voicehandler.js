const logHandler = require("./loghandler.js");
const beepbox = require("./beepbox_synth.js");
const fs = require("fs");
const ytdl = require("ytdl-core");


const Duplex = require('stream').Duplex;

class VoiceHandler {
    constructor() {
        this.voiceConnections = [];
        this.joinChannel = joinChannel;
        this.leaveChannel = leaveChannel;
        this.beepBox = beepBox;
        this.youTube = youTube;
        this.playNext = playNext;
    }
}

function joinChannel(bot, msg, channelid) {
    var vc = bot.channels.find((v) => { return v.id == channelid });
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
}

function leaveChannel(bot, msg, channelid) {
    var index = this.voiceConnections.findIndex((e) => { return e.channel.id == channelid });
    if (index > -1) {
        if (this.voiceConnections[index].dispatcher) this.voiceConnections[index].dispatcher.end("dc");
        this.voiceConnections[index].disconnect();
        logHandler.warning("Left voice channel! (" + this.voiceConnections[index].channel.name + ")");
        this.voiceConnections.splice(index, 1);
    }
}

function beepBox(bot, msg, channelid, beepstring) {
    var voice = this.voiceConnections.find((e) => { return e.channel.id == channelid });
    if (voice) {
        voice.queue.push({ type: "beepbox", url: beepstring });
        if (voice.queue.length == 1) {
            var beepBuffer = getBeepBoxBuffer(beepstring);
            var readableStream = bufferToStream(beepBuffer);
            var dispatcher = voice.playStream(readableStream);
            voice.dispatcher = dispatcher;
            voice.dispatcher.on("end", (reason) => {
                if (reason !== "dc") {
                    this.playNext(voice.channel.id);
                }
            });
        }
        else {
            msg.channel.send("Added to queue.");
        }
    }
}

function youTube(bot, msg, channelid, yturl) {
    var voice = this.voiceConnections.find((e) => { return e.channel.id == channelid });
    if (voice) {
        voice.queue.push({ type: "youtube", url: yturl });
        if (voice.queue.length == 1) {
            var stream = ytdl(yturl, { filter: 'audioonly' });
            var dispatcher = voice.playStream(stream);
            voice.dispatcher = dispatcher;
            voice.dispatcher.on("end", (reason) => {
                if (reason !== "dc") {
                    this.playNext(voice.channel.id);
                }
            });
        }
        else {
            msg.channel.send("Added to queue.");
        }
    }
}


function playNext(channelid) {
    var voice = this.voiceConnections.find((e) => { return e.channel.id == channelid });
    if (voice) {
        if (voice.queue.length > 1) {
            var next = voice.queue[1];
            switch (next.type) {
                case "beepbox":
                    var beepBuffer = getBeepBoxBuffer(next.url);
                    var readableStream = bufferToStream(beepBuffer);
                    var dispatcher = voice.playStream(readableStream);
                    voice.dispatcher = dispatcher;
                    voice.dispatcher.on("end", (reason) => {
                        if (reason !== "dc") {
                            this.playNext(voice.channel.id);
                        }
                    });
                    break;
                case "youtube":
                    var stream = ytdl(next.url, { filter: 'audioonly' });
                    var dispatcher = voice.playStream(stream);
                    voice.dispatcher = dispatcher;
                    voice.dispatcher.on("end", (reason) => {
                        if (reason !== "dc") {
                            this.playNext(voice.channel.id);
                        }
                    });
                    break;
            }
            voice.queue.splice(0, 1);
        }
    }
}

function getBeepBoxBuffer(bbstring) {
    var e = new beepbox.Synth(bbstring);
    if (true)
        for (var i = 0; i < e.song.loopStart; i++)
            e.nextBar();
    var s = e.totalSamples, a = new Float32Array(s);
    e.synthesize(a, s);
    var r = 1
        , o = 1
        , h = 44100
        , l = 2
        , u = 8 * l
        , p = o * s
        , d = 44 + p * l
        , f = 0
        , g = new ArrayBuffer(d)
        , m = new DataView(g);
    m.setUint32(f, 1380533830, !1),
        f += 4,
        m.setUint32(f, 36 + p * l, !0),
        f += 4,
        m.setUint32(f, 1463899717, !1),
        f += 4,
        m.setUint32(f, 1718449184, !1),
        f += 4,
        m.setUint32(f, 16, !0),
        f += 4,
        m.setUint16(f, 1, !0),
        f += 2,
        m.setUint16(f, o, !0),
        f += 2,
        m.setUint32(f, h, !0),
        f += 4,
        m.setUint32(f, h * l * o, !0),
        f += 4,
        m.setUint16(f, l, !0),
        f += 2,
        m.setUint16(f, u, !0),
        f += 2,
        m.setUint32(f, 1684108385, !1),
        f += 4,
        m.setUint32(f, p * l, !0),
        f += 4;
    var b, v;
    r == o ? (b = 1,
        v = 1) : (b = r,
            v = o);
    var C;
    if (l > 1)
        for (var y = 0; s > y; y++) {
            C = Math.floor(a[y * b] * ((1 << u - 1) - 1));
            for (var w = 0; v > w; w++)
                if (2 == l)
                    m.setInt16(f, C, !0),
                        f += 2;
                else {
                    if (4 != l)
                        throw new Error("unsupported sample size");
                    m.setInt32(f, C, !0),
                        f += 4
                }
        }
    else
        for (var y = 0; s > y; y++) {
            C = Math.floor(127 * a[y * b] + 128);
            for (var w = 0; v > w; w++)
                m.setUint8(f, C > 255 ? 255 : 0 > C ? 0 : C),
                    f++
        }
    var x = Buffer.from(g);
    return x;
}

function bufferToStream(buffer) {
    let stream = new Duplex();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

module.exports = new VoiceHandler();