const logHandler = require("./loghandler.js");
const Discord = require("discord.js");

const numberEmojis = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];


class MafiaGameHandler {
    constructor() {
        this.games = [];
    }

    createGame(bot, msg, userId) {
        return new Promise((resolve, reject) => {
            if (!this.checkUserGames(userId)) {
                bot.users.fetch(userId)
                    .then((gameuser) => {
                        let newGame = new MafiaGame(gameuser);
                        let sendEmbed = new Discord.MessageEmbed()
                            .setColor("#0a50a1")
                            .setTitle('Creating new game')
                            .setAuthor("Rocket League Mafia", bot.user.avatarURL())
                            .setDescription(`Successfully created a game.\nTo set the game size react to this message with the correct number. You have **1 minute**!`)
                            .addField('Lobby ID', newGame.gameId)
                            .setTimestamp()
                            .setFooter('RL Mafia Lobby created by ' + newGame.gameCreator.username, newGame.gameCreator.avatarURL());
                        msg.channel.send(sendEmbed)
                            .then(async (gamemsg) => {
                                newGame.gameMessage = gamemsg;
                                await gamemsg.react(numberEmojis[2]);
                                await gamemsg.react(numberEmojis[3]);
                                await gamemsg.react(numberEmojis[4]);
                                await gamemsg.react(numberEmojis[5]);
                                await gamemsg.react(numberEmojis[6]);
                                await gamemsg.react(numberEmojis[7]);
                                await gamemsg.react(numberEmojis[8]);
                                let filter = (reaction, user) => user.id === gameuser.id && numberEmojis.includes(reaction.emoji.name);
                                let collector = gamemsg.createReactionCollector(filter, { time: 60000 });
                                collector.on("collect", (reaction, user) => {
                                    switch (reaction.emoji.name) {
                                        case numberEmojis[2]:
                                            newGame.gameSize = 2;
                                            break;
                                        case numberEmojis[3]:
                                            newGame.gameSize = 3;
                                            break;
                                        case numberEmojis[4]:
                                            newGame.gameSize = 4;
                                            break;
                                        case numberEmojis[5]:
                                            newGame.gameSize = 5;
                                            break;
                                        case numberEmojis[6]:
                                            newGame.gameSize = 6;
                                            break;
                                        case numberEmojis[7]:
                                            newGame.gameSize = 7;
                                            break;
                                        case numberEmojis[8]:
                                            newGame.gameSize = 8;
                                            break;
                                    }
                                    if (newGame.gameSize != 0) {
                                        collector.stop("selectedSize");
                                        newGame.gameCreator.points = 0;
                                        newGame.players.push(newGame.gameCreator);
                                        this.games.push(newGame);
                                        this.waitForPlayerJoins(bot, msg, newGame);
                                        resolve(newGame);
                                    }
                                });
                                collector.on("end", (collected, reason) => {
                                    if (reason != "selectedSize") {
                                        gamemsg.channel.send("You did not react! Removing game...");
                                        gamemsg.delete();
                                        reject();
                                    }
                                });
                            })
                            .catch((err) => {
                                msg.channel.send("There was an error while creating the game!");
                                logHandler.error(err);
                                reject();
                            });
                    })
                    .catch((err) => {
                        msg.channel.send("There was an error while creating the game!");
                        logHandler.error(err);
                        reject();
                    });
            }
            else {
                msg.channel.send("You are already in a different game!");
                reject();
            }
        });
    }

    waitForPlayerJoins(bot, msg, game) {
        game.gameMessage.reactions.removeAll()
            .then(() => {
                let playerlist = game.players.map((p) => p.username).join("\n");
                let sendEmbed = new Discord.MessageEmbed()
                    .setColor("#0a50a1")
                    .setTitle('Waiting for players')
                    .setAuthor("Rocket League Mafia", bot.user.avatarURL())
                    .setDescription(`Waiting for players to join the game.`)
                    .addField("Players", playerlist)
                    .addField('Lobby ID', game.gameId)
                    .setTimestamp()
                    .setFooter('RL Mafia Lobby created by ' + game.gameCreator.username, game.gameCreator.avatarURL());
                game.gameMessage.edit(sendEmbed);
                game.gameMessage.react("☑️").then(() => {
                    let filter = (reaction, user) => reaction.emoji.name === "☑️" && user.id !== bot.user.id && !this.checkUserGames(user.id);
                    let collector = game.gameMessage.createReactionCollector(filter, { time: 60000 });
                    collector.on("collect", (reaction, user) => {
                        user.points = 0;
                        game.players.push(user);
                        playerlist = game.players.map((p) => p.username).join("\n");
                        let sendEmbed = new Discord.MessageEmbed()
                            .setColor("#0a50a1")
                            .setTitle('Waiting for players')
                            .setAuthor("Rocket League Mafia", bot.user.avatarURL())
                            .setDescription(`Waiting for players to join the game.`)
                            .addField("Players", playerlist)
                            .addField('Lobby ID', game.gameId)
                            .setTimestamp()
                            .setFooter('RL Mafia Lobby created by ' + game.gameCreator.username, game.gameCreator.avatarURL());
                        game.gameMessage.edit(sendEmbed);
                        if (game.players.length == game.gameSize) {
                            collector.stop("gamefull");
                        }
                    });
                    collector.on("end", (collection, reason) => {
                        if (reason == "gamefull") {
                            this.newRound(bot, msg, game);
                        }
                        else {
                            game.gameMessage.edit("There were not enough players for the game to start! Removed game.");
                            this.games.splice(this.games.findIndex((g) => g.gameId == game.gameId), 1);
                        }
                    });
                });
            });
    }

    newRound(bot, msg, game) {
        game.gameMessage.reactions.removeAll()
            .then(async () => {
                this.sendRoles(bot, msg, game);
                let playerlist = game.players.map((p) => p.username).join("\n");
                let sendEmbed = new Discord.MessageEmbed()
                    .setColor("#0a50a1")
                    .setTitle('Round started')
                    .setAuthor("Rocket League Mafia", bot.user.avatarURL())
                    .setDescription(`The game has started! Everyone has their roles and teams, time to play! You have **30 minutes** to play.`)
                    .addField("Players", playerlist)
                    .addField('Lobby ID', game.gameId)
                    .setTimestamp()
                    .setFooter('RL Mafia Lobby created by ' + game.gameCreator.username, game.gameCreator.avatarURL());
                game.gameMessage.edit(sendEmbed);
                await game.gameMessage.react("🟠");
                await game.gameMessage.react("🔵");
                let filter = (reaction, user) => user.id === game.gameCreator.id;
                let collector = game.gameMessage.createReactionCollector(filter, { time: 1800000 });
                collector.on("collect", (reaction, user) => {
                    playerlist = game.players.map((p) => p.username).join("\n");
                    let mafiaTeamWin = false; //If Mafia is on winning team, no vote, teammates get 2 points.
                    let winnerTeamColor = "#0a50a1";
                    switch (reaction.emoji.name) {
                        case "🟠":
                            mafiaTeamWin = this.checkResult(bot, msg, game, game.teamOrange); //If Mafia is on winning team, no vote, teammates get 2 points.
                            winnerTeamColor = "#ffb026";
                            break;
                        case "🔵":
                            mafiaTeamWin = this.checkResult(bot, msg, game, game.teamBlue); //If Mafia is on winning team, no vote, teammates get 2 points.
                            winnerTeamColor = "#2b87ff";
                            break;
                    }
                    if (mafiaTeamWin) {
                        let sendEmbed = new Discord.MessageEmbed()
                            .setColor(winnerTeamColor)
                            .setTitle('Round Finished')
                            .setAuthor("Rocket League Mafia", bot.user.avatarURL())
                            .setDescription(`The Mafia was **${game.mafiaUser.username}**! His team still won, so no vote is needed, and his teammates get 2 points!`)
                            .addField("Winner Team ", (winnerTeamColor == "#ffb026" ? "Orange" : "Blue"))
                            .addField("Players", playerlist)
                            .addField('Lobby ID', game.gameId)
                            .setTimestamp()
                            .setFooter('RL Mafia Lobby created by ' + game.gameCreator.username, game.gameCreator.avatarURL());
                        game.gameMessage.edit(sendEmbed).then(() => {
                            setTimeout(() => {
                                this.calculatePoints(bot, msg, game, mafiaTeamWin);
                                this.displayResults(bot, msg, game);
                            }, 5000);
                        });
                    }
                    else {
                        let sendEmbed = new Discord.MessageEmbed()
                            .setColor(winnerTeamColor)
                            .setTitle('Round Finished')
                            .setAuthor("Rocket League Mafia", bot.user.avatarURL())
                            .setDescription("It is time to vote!\nYou have **1 minute** to vote!")
                            .addField("Winner Team ", (winnerTeamColor == "#ffb026" ? "Orange" : "Blue"))
                            .addField("Players", playerlist)
                            .addField('Lobby ID', game.gameId)
                            .setTimestamp()
                            .setFooter('RL Mafia Lobby created by ' + game.gameCreator.username, game.gameCreator.avatarURL());
                        game.gameMessage.edit(sendEmbed);
                        this.sendVotes(bot, msg, game)
                            .then(() => {
                                setTimeout(() => {
                                    this.calculatePoints(bot, msg, game, mafiaTeamWin);
                                    this.displayResults(bot, msg, game);
                                }, 5000);
                            });
                    }
                    collector.stop();
                });
            });
    }

    sendRoles(bot, msg, game) {
        this.createTeams(bot, msg, game);
        game.mafiaIndex = Math.floor(Math.random() * game.players.length);
        game.mafiaUser = game.players[game.mafiaIndex];
        for (let i = 0; i < game.players.length; i++) {
            let dmstring = "";
            game.players[i].createDM().then((dm) => {
                if (game.players[i].id == game.mafiaUser.id) {
                    dmstring += "You are the **Mafia**! Time to throw!";
                }
                else {
                    dmstring += "You are **NOT** the Mafia! You have to win the game, and guess who the Mafia is!";
                }
                if (this.getPlayerTeamColor(game, game.players[i]) == "orange") {
                    dmstring += "\nYou are in team **ORANGE**!";
                }
                else {
                    dmstring += "\nYou are in team **BLUE**";
                }
                let teammatestring = this.getPlayerteammates(game.players[i]).map((p) => p.username).join("\n");
                let sendEmbed = new Discord.MessageEmbed()
                    .setColor("#0a50a1")
                    .setTitle('Team Information')
                    .setAuthor("Rocket League Mafia", bot.user.avatarURL())
                    .setDescription(dmstring)
                    .addField("Teammates", teammatestring != "" ? teammatestring : "None")
                    .addField('Lobby ID', game.gameId)
                    .setTimestamp()
                    .setFooter('RL Mafia Lobby created by ' + game.gameCreator.username, game.gameCreator.avatarURL());
                dm.send(sendEmbed);
            });
        }
    }

    createTeams(bot, msg, game) {
        game.teamOrange = []; // Team 1
        game.teamBlue = []; // Team 2 
        for (let i = 0; i < game.players.length; i++) {
            let teamNumber = Math.floor(Math.random() * 2);
            if (game.teamOrange.length == Math.floor(game.gameSize / 2)) {
                teamNumber = 2;
            }
            if (game.teamBlue.length == Math.floor(game.gameSize / 2)) {
                teamNumber = 1;
            }
            if (teamNumber == 1) {
                game.teamOrange.push(game.players[i]);
            }
            else {
                game.teamBlue.push(game.players[i]);
            }
        }
    }

    sendVotes(bot, msg, game) {
        return new Promise((resolve, reject) => {
            let playerlist = game.players.map((p) => p.username);
            let playervotestring = "";
            for (let i = 0; i < playerlist.length; i++) {
                playervotestring += "\n" + numberEmojis[i + 1] + " " + playerlist[i];
            }
            let votes = 0;
            for (let i = 0; i < game.players.length; i++) {
                game.players[i].createDM().then((dm) => {
                    if (game.players[i].id != game.mafiaUser.id) {
                        let sendEmbed = new Discord.MessageEmbed()
                            .setColor("#0a50a1")
                            .setTitle('Voting')
                            .setAuthor("Rocket League Mafia", bot.user.avatarURL())
                            .setDescription("It is time to vote! Click the number of the player who you think the mafia was! \n" + playervotestring)
                            .addField('Lobby ID', game.gameId)
                            .setTimestamp()
                            .setFooter('RL Mafia Lobby created by ' + game.gameCreator.username, game.gameCreator.avatarURL());
                        dm.send(sendEmbed)
                            .then(async (votemsg) => {
                                for (let j = 0; j < game.players.length; j++) {
                                    await votemsg.react(numberEmojis[j + 1]);
                                }
                                let filter = (reaction, user) => user.id === game.players[i].id && numberEmojis.includes(reaction.emoji.name)
                                let collector = votemsg.createReactionCollector(filter, { time: 60000 });
                                collector.on("collect", (reaction) => {
                                    switch (reaction.emoji.name) {
                                        case numberEmojis[1]:
                                            game.players[i].vote = 0;
                                            break;
                                        case numberEmojis[2]:
                                            game.players[i].vote = 1;
                                            break;
                                        case numberEmojis[3]:
                                            game.players[i].vote = 2;
                                            break;
                                        case numberEmojis[4]:
                                            game.players[i].vote = 3;
                                            break;
                                        case numberEmojis[5]:
                                            game.players[i].vote = 4;
                                            break;
                                        case numberEmojis[6]:
                                            game.players[i].vote = 5;
                                            break;
                                        case numberEmojis[7]:
                                            game.players[i].vote = 6;
                                            break;
                                        case numberEmojis[8]:
                                            game.players[i].vote = 7;
                                            break;
                                    }
                                    collector.stop();
                                });
                                collector.on("end", (collected, reason) => {
                                    votes++;
                                    if (votes == game.gameSize - 1) {
                                        resolve();
                                    }
                                });
                            });
                    }
                    else {
                        dm.send("You were the Mafia, the others are voting right now! Be patient.");
                    }
                });
            }
        });
    }


    checkResult(bot, msg, game, teamWon) {
        let mafiaWin = false;
        for (let i = 0; i < teamWon.length; i++) {
            if (game.mafiaUser.id == teamWon[i].id) {
                mafiaWin = true;
            }
        }
        return mafiaWin;
    }

    calculatePoints(bot, msg, game, mafiaWin) {
        if (mafiaWin) {
            let teammates = this.getPlayerteammates(game.mafiaUser);
            for (let i = 0; i < game.players.length; i++) {
                if (teammates.some(e => e.id == game.players[i].id)) {
                    game.players[i].points += 2;
                }
            }
        }
        else {
            let correctguesses = 0;
            for (let i = 0; i < game.players.length; i++) {
                if (game.players[i].vote == game.mafiaIndex) {
                    game.players[i].points += 1;
                    correctguesses++;
                }
            }
            if (correctguesses < game.gameSize / 2) {
                for (let i = 0; i < game.players.length; i++) {
                    if (game.players[i].id == game.mafiaUser.id) {
                        game.players[i].points += 3;
                    }
                }
            }
        }
    }

    displayResults(bot, msg, game) {
        let resultstring = "";
        for (let i = 0; i < game.players.length; i++) {
            resultstring += "\n" + game.players[i].username + ": " + game.players[i].points + " points";
        }
        game.gameMessage.reactions.removeAll().then(() => {
            let sendEmbed = new Discord.MessageEmbed()
                .setColor("#0a50a1")
                .setTitle('Results')
                .setAuthor("Rocket League Mafia", bot.user.avatarURL())
                .setDescription(resultstring)
                .addField("The Mafia", game.mafiaUser.username)
                .addField('Lobby ID', game.gameId)
                .setTimestamp()
                .setFooter('RL Mafia Lobby created by ' + game.gameCreator.username, game.gameCreator.avatarURL());
            game.gameMessage.edit(sendEmbed)
                .then(async () => {
                    await game.gameMessage.react("🔄");
                    await game.gameMessage.react("🔴");
                    let filter = (reaction, user) => user.id === game.gameCreator.id;
                    let collector = game.gameMessage.createReactionCollector(filter, { time: 300000 });
                    collector.on("collect", (reaction, user) => {
                        switch (reaction.emoji.name) {
                            case "🔴":
                                game.gameMessage.channel.send("Removed game with ID: " + game.gameId);
                                this.games.splice(this.games.findIndex((g) => g.gameId == game.gameId), 1);
                                break;
                            case "🔄":
                                this.newRound(bot, msg, game);
                                break;
                        }
                        collector.stop();
                    });
                });
        });
    }

    //Returns true if the user is already in a game.
    checkUserGames(userId) {
        let userInGame = false;
        for (let i = 0; i < this.games.length; i++) {
            for (let j = 0; j < this.games[i].players.length; j++) {
                if (this.games[i].players[j].id == userId) {
                    userInGame = true;
                }
            }
        }
        return userInGame;
    }

    //Returns the game of the user
    getUserGame(playerId) {
        let userGame = {};
        for (let i = 0; i < this.games.length; i++) {
            for (let j = 0; j < this.games[i].players.length; j++) {
                if (this.games[i].players[j].id == playerId) {
                    userGame = this.games[i];
                }
            }
        }
        return userGame;
    }

    //Returns the team color of a player in string format
    getPlayerTeamColor(game, player) {
        let teamColor;
        if (this.checkUserGames(player.id)) {
            let game = this.getUserGame(player.id);
            for (let i = 0; i < game.teamBlue.length; i++) {
                if (game.teamBlue[i].id == player.id) {
                    teamColor = "blue";
                }
            }
            for (let i = 0; i < game.teamOrange.length; i++) {
                if (game.teamOrange[i].id == player.id) {
                    teamColor = "orange";
                }
            }
        }
        return teamColor;
    }


    //Returns the teammates of the player, if any
    getPlayerteammates(player) {
        let teammates = [];
        if (this.checkUserGames(player.id)) {
            let game = this.getUserGame(player.id);
            for (let i = 0; i < game.teamBlue.length; i++) {
                if (game.teamBlue[i].id == player.id) {
                    for (let j = 0; j < game.teamBlue.length; j++) {
                        if (game.teamBlue[j].id != player.id) {
                            teammates.push(game.teamBlue[j]);
                        }
                    }
                }
            }
            for (let i = 0; i < game.teamOrange.length; i++) {
                if (game.teamOrange[i].id == player.id) {
                    for (let j = 0; j < game.teamOrange.length; j++) {
                        if (game.teamOrange[j].id != player.id) {
                            teammates.push(game.teamOrange[j]);
                        }
                    }
                }
            }
        }
        return teammates;
    }
}

module.exports = new MafiaGameHandler();


class MafiaGame {
    constructor(gameCreator) {
        this.gameMessage = {};
        this.gameId = gameCreator.id;
        this.gameCreator = gameCreator;
        this.gameSize = 0;
        this.players = [];
        this.teamOrange = []; //Team 1 
        this.teamBlue = []; // Team 2 
        this.mafiaUser = {};
        this.mafiaIndex = 0;
    }
}