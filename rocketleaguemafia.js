const logHandler = require("./loghandler.js");
const Discord = require("discord.js");

const numberEmojis = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];


class MafiaGameHandler {
    constructor() {
        this.games = [];
    }

    getNumberOfTeams(bot, msg, game) {
        return new Promise((resolve, reject) => {
            let sendEmbed = new Discord.MessageEmbed()
                .setColor("#0a50a1")
                .setTitle('Creating new game')
                .setAuthor("Rocket League Mafia", bot.user.avatarURL())
                .setDescription(`Successfully created a game.\nTo set the number of teams react with the appropriate number. You have **1 minute**!`)
                .addField('Lobby ID', game.gameId)
                .setTimestamp()
                .setFooter('RL Mafia Lobby created by ' + game.gameCreator.username, game.gameCreator.avatarURL());
            msg.channel.send(sendEmbed)
                .then(async (gamemsg) => {
                    game.gameMessage = gamemsg;
                    await game.gameMessage.react(numberEmojis[1]);
                    await game.gameMessage.react(numberEmojis[2]);
                    let filter = (reaction, user) => user.id === game.gameCreator.id && numberEmojis.includes(reaction.emoji.name);
                    let collector = game.gameMessage.createReactionCollector(filter, { time: 60000 });
                    collector.on("collect", (reaction, user) => {
                        switch (reaction.emoji.name) {
                            case numberEmojis[1]:
                                game.teamNumber = 1;
                                break;
                            case numberEmojis[2]:
                                game.teamNumber = 2;
                                break;
                        }
                        if (game.teamNumber != 0) {
                            collector.stop("selectedteamSize");
                            resolve(game);
                        }
                    });
                    collector.on("end", (collected, reason) => {
                        if (reason != "selectedteamSize") {
                            reject("No selection of the number of teams.");
                        }
                    });
                })
                .catch((err) => {
                    logHandler.error(err);
                    reject(err);
                });
        });
    }
    getNumberOfPlayers(bot, msg, game) {
        return new Promise((resolve, reject) => {
            let sendEmbed = new Discord.MessageEmbed()
                .setColor("#0a50a1")
                .setTitle('Creating new game')
                .setAuthor("Rocket League Mafia", bot.user.avatarURL())
                .setDescription(`Successfully created a game.\nTo set the number of players react with the appropriate number. You have **1 minute**!`)
                .addField('Lobby ID', game.gameId)
                .setTimestamp()
                .setFooter('RL Mafia Lobby created by ' + game.gameCreator.username, game.gameCreator.avatarURL());
            game.gameMessage.reactions.removeAll()
                .then(() => {
                    game.gameMessage.edit(sendEmbed)
                        .then(async () => {
                            await game.gameMessage.react(numberEmojis[2]);
                            await game.gameMessage.react(numberEmojis[3]);
                            await game.gameMessage.react(numberEmojis[4]);
                            await game.gameMessage.react(numberEmojis[5]);
                            await game.gameMessage.react(numberEmojis[6]);
                            await game.gameMessage.react(numberEmojis[7]);
                            await game.gameMessage.react(numberEmojis[8]);
                            let filter = (reaction, user) => user.id === game.gameCreator.id && numberEmojis.includes(reaction.emoji.name);
                            let collector = game.gameMessage.createReactionCollector(filter, { time: 60000 });
                            collector.on("collect", (reaction, user) => {
                                switch (reaction.emoji.name) {
                                    case numberEmojis[2]:
                                        game.gameSize = 2;
                                        break;
                                    case numberEmojis[3]:
                                        game.gameSize = 3;
                                        break;
                                    case numberEmojis[4]:
                                        game.gameSize = 4;
                                        break;
                                    case numberEmojis[5]:
                                        game.gameSize = 5;
                                        break;
                                    case numberEmojis[6]:
                                        game.gameSize = 6;
                                        break;
                                    case numberEmojis[7]:
                                        game.gameSize = 7;
                                        break;
                                    case numberEmojis[8]:
                                        game.gameSize = 8;
                                        break;
                                }
                                if (game.gameSize != 0) {
                                    collector.stop("selectedplayerSize");
                                    game.gameCreator.points = 0;
                                    game.players.push(game.gameCreator);
                                    this.games.push(game);
                                    this.waitForPlayerJoins(bot, msg, game);
                                    resolve(game);
                                }
                            });
                            collector.on("end", (collected, reason) => {
                                if (reason != "selectedplayerSize") {
                                    reject("Not enough players joined.");
                                }
                            });
                        })
                        .catch((err) => {
                            logHandler.error(err);
                            reject(err);
                        });

                });
        })
            .catch((err) => {
                logHandler.error(err);
                reject(err);
            });
    }


    createGame(bot, msg, userId) {
        return new Promise((resolve, reject) => {
            if (!this.checkUserGames(userId)) {
                bot.users.fetch(userId)
                    .then((gameuser) => {
                        let newGame = new MafiaGame(gameuser);
                        this.getNumberOfTeams(bot, msg, newGame)
                            .then((newGame) => {
                                this.getNumberOfPlayers(bot, msg, newGame)
                                    .then((createdGame) => {
                                        resolve(createdGame);
                                    })
                                    .catch((err) => {
                                        newGame.gameMessage.edit(err);
                                        logHandler.error(err);
                                        reject(err);
                                    })
                            })
                            .catch((err) => {
                                newGame.gameMessage.edit(err);
                                logHandler.error(err);
                                reject(err);
                            })
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
                    .setTitle(`Waiting for players ${game.players.length}/${game.gameSize}`)
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
                        sendEmbed.setTitle(`Waiting for players ${game.players.length}/${game.gameSize}`);
                        sendEmbed.fields = [];
                        sendEmbed.addField("Players", playerlist);
                        sendEmbed.addField('Lobby ID', game.gameId);
                        sendEmbed.setTimestamp();
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
                let playerlist = game.players.map((p) => p.username + ": " + p.points + " points").join("\n");
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
                if (game.teamNumber === 2) {
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
                }
                else {
                    await game.gameMessage.react("✔️");
                    await game.gameMessage.react("❌");
                    let filter = (reaction, user) => user.id === game.gameCreator.id;
                    let collector = game.gameMessage.createReactionCollector(filter, { time: 1800000 });
                    collector.on("collect", (reaction, user) => {
                        playerlist = game.players.map((p) => p.username).join("\n");
                        let mafiaTeamWin = false; //If Mafia is on winning team, no vote, teammates get 2 points.
                        let winnerTeamColor = "#0a50a1";
                        switch (reaction.emoji.name) {
                            case "✔️":
                                mafiaTeamWin = true //If Mafia is on winning team, no vote, teammates get 2 points.
                                winnerTeamColor = "#38d400";
                                break;
                            case "❌":
                                mafiaTeamWin = false //If Mafia is on winning team, no vote, teammates get 2 points.
                                winnerTeamColor = "#d40000";
                                break;
                        }
                        if (mafiaTeamWin) {
                            let sendEmbed = new Discord.MessageEmbed()
                                .setColor(winnerTeamColor)
                                .setTitle('Round Finished')
                                .setAuthor("Rocket League Mafia", bot.user.avatarURL())
                                .setDescription(`The Mafia was **${game.mafiaUser.username}**! His team still won, so no vote is needed, and his teammates get 2 points!`)
                                .addField("Winner Team ", (winnerTeamColor == "#38d400" ? "Us" : "Enemy"))
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
                                .addField("Winner Team ", (mafiaTeamWin ? "Us" : "Enemy"))
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
                }
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
                if (game.teamNumber === 2) { // 2 teams in the game
                    if (this.getPlayerTeamColor(game.players[i]) == "orange") {
                        dmstring += "\nYou are in team **ORANGE**!";
                    }
                    else {
                        dmstring += "\nYou are in team **BLUE**";
                    }
                }
                else { // 1 team in the game
                    dmstring += "\nYou are all in the same team!";
                }
                let teammatestring = this.getPlayerTeammates(game.players[i]).map((p) => p.username);
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
        if (game.teamNumber === 2) {
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
            let teammates = this.getPlayerTeammates(game.mafiaUser);
            for (let i = 0; i < game.players.length; i++) {
                if (teammates.some(e => e.id == game.players[i].id)) {
                    game.players[i].points += 2; //Winner team gets 2 points if the mafia is in the same team.
                }
            }
        }
        else {
            let correctguesses = 0;
            let winnerplayers = game.players.filter(p => this.getPlayerTeammates(game.mafiaUser).indexOf(p) === -1 && p.id !== game.mafiaUser.id);
            for (let i = 0; i < game.players.length; i++) {
                if (winnerplayers.indexOf(game.players[i]) !== -1) {
                    game.players[i].points += 1;  //Winner team gets 1 point if mafia is in the other team
                }
                if (game.players[i].vote == game.mafiaIndex) {
                    game.players[i].points += 1;
                    correctguesses++;
                }
            }
            game.players[this.getMafiaPlayerIndex(game)].points += 1;
            if (correctguesses < game.gameSize / 2) {
                for (let i = 0; i < game.players.length; i++) {
                    if (game.players[i].id == game.mafiaUser.id) {
                        game.players[i].points += 2;
                    }
                }
            }
        }
    }

    getMafiaPlayerIndex(game) {
        for (let i = 0; i < game.players.length; i++) {
            if (game.players[i].id == game.mafiaUser.id) {
                return i;
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
                                game.gameMessage.edit("Removed game with ID: " + game.gameId);
                                this.games.splice(this.games.findIndex((g) => g.gameId == game.gameId), 1);
                                break;
                            case "🔄":
                                this.newRound(bot, msg, game);
                                break;
                        }
                        collector.stop("reacted");
                    });
                    collector.on("end", (collected, reason) => {
                        if (reason !== "reacted") {
                            game.gameMessage.edit("Removed game with ID: " + game.gameId);
                            this.games.splice(this.games.findIndex((g) => g.gameId == game.gameId), 1);
                        }
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
    getPlayerTeamColor(player) {
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
    getPlayerTeammates(player) {
        let teammates = [];
        if (this.checkUserGames(player.id)) {
            let game = this.getUserGame(player.id);
            if (game.teamNumber === 2) { // 2 teams in the game
                for (let i = 0; i < game.teamBlue.length; i++) {
                    if (game.teamBlue[i].id === player.id) {
                        for (let j = 0; j < game.teamBlue.length; j++) {
                            if (game.teamBlue[j].id !== player.id) {
                                teammates.push(game.teamBlue[j]);
                            }
                        }
                    }
                }
                for (let i = 0; i < game.teamOrange.length; i++) {
                    if (game.teamOrange[i].id === player.id) {
                        for (let j = 0; j < game.teamOrange.length; j++) {
                            if (game.teamOrange[j].id !== player.id) {
                                teammates.push(game.teamOrange[j]);
                            }
                        }
                    }

                }
            }
            else { // 1 team in the game
                teammates = game.players.filter(p => p.id !== player.id);
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
        this.teamNumber = 0;
        this.players = [];
        this.teamOrange = []; //Team 1 
        this.teamBlue = []; // Team 2 
        this.mafiaUser = {};
        this.mafiaIndex = 0;
    }
}