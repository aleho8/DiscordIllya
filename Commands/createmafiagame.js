const mafiaHandler = require("../rocketleaguemafia.js");
const permHandler = require("../permhandler.js");
const logHandler = require("../loghandler.js");

module.exports = {
    group: "mafia",
    name: "create",
    permissions: permHandler.Permissions.USER,
    args: "",
    aliases: ["createmafia"],
    description: "Create a new Mafia game.",
    execute: (bot, msg, args) => {
        mafiaHandler.createGame(bot, msg, msg.author.id).then((g) => {
            logHandler.warning("Created Mafia game with ID: " + g.gameId);
        })
        .catch((r) => {
            logHandler.warning(r);
        });
    }
}