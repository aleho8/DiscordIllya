const fs = require("fs");
const logHandler = require("./loghandler.js");

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Discord Bot Token> '
});


const configname = "./config.json";

class ConfigHandler {
    constructor() {
        this.discordToken = "";
        this.owner = {};
        this.admins = [];
        this.blacklist = [];
    }

    readConfig(callback) {
        logHandler.warning("Reading config file...");
        fs.access(configname, fs.constants.F_OK | fs.constants.W_OK, (err) => {
            if (err) {
                logHandler.error(err.message);
                logHandler.warning("Couldn't access config file! Using empty config. Paste Discord Bot Token here:");
                getBotToken((token) => {
                    this.discordToken = token;
                    this.saveConfig();
                    callback();
                });
            }
            else {
                fs.readFile(configname, (err, data) => {
                    if (err) {
                        logHandler.error(err.message);
                        logHandler.warning("Couldn't read config file! Using empty config. Paste Discord Bot Token here:");
                        getBotToken((token) => {
                            this.discordToken = token;
                            this.saveConfig();
                            callback();
                        });
                    }
                    else {
                        try {
                            var config = JSON.parse(data);
                            if (!config.discordToken) {
                                logHandler.warning("The config file contains an empty token, the file might be corrupted!");
                                getBotToken((token) => {
                                    this.discordToken = token;
                                    this.saveConfig();
                                    callback();
                                });
                            }
                            else {
                                this.discordToken = config.discordToken;
                                this.owner = config.owner;
                                this.admins = config.admins;
                                this.blacklist = config.blacklist;
                                logHandler.warning("Successfully read config file.");
                                callback();
                            }
                        }
                        catch (e) {
                            logHandler.error(e.message);
                            logHandler.warning("Couldn't read config file! Using empty config. Paste Discord Bot Token here:");
                            getBotToken((token) => {
                                this.discordToken = token;
                                this.saveConfig();
                                callback();
                            });

                        }
                    }
                });
            }
        });
    }

    saveConfig() {
        fs.access(configname, fs.constants.F_OK | fs.constants.W_OK, (err) => {
            if (err) {
                logHandler.error(err.message);
                logHandler.warning("Couldn't access config file! Trying to create one...");
            }
            fs.writeFile(configname, this.getConfigString(), (err) => {
                if (err) {
                    logHandler.error(err.message);
                    logHandler.warning("Couldn't access config file! This means your config will be lost after exiting.");
                }
                else {
                    logHandler.warning("Saved config file.");
                }
            });
        });
    }

    getConfigString() {
        var c = {
            discordToken: this.discordToken,
            owner: this.owner,
            admins: this.admins,
            blacklist: this.blacklist
        }
        return JSON.stringify(c);
    }
}




function getBotToken(callback) {
    rl.prompt();

    rl.on('line', (line) => {
        line = line.trim();
        rl.close();
        callback(line);
    });
}

module.exports = new ConfigHandler();