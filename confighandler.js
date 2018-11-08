const fs = require("fs");
const logHandler = require("./loghandler.js");

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Discord Bot Token> '
});


const configname = "config.json";

class ConfigHandler {
    constructor() {
        this.discordToken = "";
        this.owner = {};
        this.admins = [];
        this.blacklist = [];
        this.readConfig = readConfig;
        this.saveConfig = saveConfig;
        this.getConfigString = getConfigString;
    }
}

function readConfig(callback) {
    logHandler.warning("Reading config file...");
    fs.access(configname, fs.constants.F_OK | fs.constants.W_OK, (err) => {
        if (err) {
            logHandler.error(err.message);
            logHandler.warning("Couldn't access config file! Using empty config. Paste Discord Bot Token here:");
            getBotToken((token) => {
                this.discordToken = token;
                callback();
            });
        }
        else {
            fs.readFile(filepath, (err, data) => {
                if (err) {
                    logHandler.error(err.message);
                    logHandler.warning("Couldn't read config file! Using empty config. Paste Discord Bot Token here:");
                    getBotToken((token) => {
                        this.discordToken = token;
                        callback();
                    });
                }
                else {
                    try {
                        var config = JSON.parse(data);
                        this.discordToken = config.discordToken;
                        this.owner = config.owner;
                        this.admins = config.admins;
                        this.blacklist = config.blacklist;
                        logHandler.warning("Successfully read config file.");
                        callback();
                    }
                    catch (e) {
                        logHandler.error(e.message);
                        logHandler.warning("Couldn't read config file! Using empty config. Paste Discord Bot Token here:");
                        getBotToken((token) => {
                            this.discordToken = token;
                        });
                        this.owner = {};
                        this.admins = [];
                        this.blacklist = [];
                        callback();
                    }
                }
            });
        }
    });
}

function saveConfig() {
    fs.access(configname, fs.constants.F_OK | fs.constants.W_OK, (err) => {
        if (err) {
            logHandler.error(err.message);
            logHandler.warning("Couldn't access config file! This means your config will be lost after exiting.");
        }
        else {
            fs.writeFile(configname, getConfigString(), (err) => {
                if (err) {
                    logHandler.error(err.message);
                    logHandler.warning("Couldn't access config file! This means your config will be lost after exiting.");
                }
                else {
                    logHandler.warning("Saved config file.");
                }
            });
        }
    });
}

function getConfigString() {
    var c = {
        discordToken: this.discordToken,
        owner: this.owner,
        admins: this.admins,
        blacklist: this.blacklist
    }
    return JSON.stringify(c);
}


function getBotToken(callback) {
    rl.prompt();

    rl.on('line', (line) => {
        line = line.trim();
        callback(line);
    });
}

module.exports = new ConfigHandler();