const permHandler = require("../permhandler.js");
const commandHandler = require("../commandhandler.js");
const logHandler = require("../loghandler.js");
const Discord = require("discord.js");

module.exports = {
    group: "",
    name: "help",
    permissions: permHandler.Permissions.USER,
    args: "<CommandGroup?>",
    aliases: [],
    description: "Sends information about the available commands.",
    execute: (bot, msg, args) => {
        let embeds = [];
        if (args.length > 0) {
            let commands = commandHandler.commands.find(c => c.name === args[0] && c.group === "") || commandHandler.commands.filter(c => c.group === args[0]);
            if (!Array.isArray(commands)) {
                commands = [commands];
            }
            for (let i = 0; i < commands.length; i++) {
                let sendEmbed = new Discord.MessageEmbed()
                    .setColor("#0a50a1")
                    .setTitle("Command: " + commands[i].name)
                    .setDescription(commands[i].description)
                    .addField('Arguments', commands[i].args != "" ? commands[i].args : "None")
                    .addField('Aliases', commands[i].aliases.length != 0 ? commands[i].aliases.join() : "None")
                    .setTimestamp()
                    .setFooter('Help Command used by ' + msg.author.username, msg.author.avatarURL());
                embeds.push(sendEmbed);
            }
        }
        else {
            let commandgroups = commandHandler.commands.map(c => c.group);
            commandgroups = commandgroups.filter((g, i) => commandgroups.indexOf(g) === i);
            let sendEmbed = new Discord.MessageEmbed()
                .setColor("#0a50a1")
                .setTitle('Command Groups')
                .setDescription("Here is the current list if the command groups, you must choose one, and use this command again.")
                .addField("Command Groups", commandgroups.join("\n"))
                .setTimestamp()
                .setFooter('Help Command used by ' + msg.author.username, msg.author.avatarURL());
            embeds.push(sendEmbed);
        }
        if (embeds.length > 0) {
            msg.author.createDM()
                .then(async (dmc) => {
                    if (embeds.length > 0) {
                        for (let i = 0; i < embeds.length; i++) {
                            await dmc.send(embeds[i]);
                        }
                    }
                    else {
                        await dmc.send("There is no command with that group or name!");
                    }
                })
                .catch((err) => {
                    msg.channel.send("I was unable to send you the list of commands in a DM! Please enable DMs to use this command.");
                    logHandler.error(err);
                });
        }
    }
};