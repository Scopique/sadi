/***************************************************************
 *                       SADI
 *            Self-Aware Digital Interface
*     A Discord bot for a Star Citizen Discord server.
 *--------------------------------------------------------------
 *  Lobby: Requires all invitees to accept a EULA for access
 *  Profiles: Additional social media info for each user
 *  SADI: Help and settings
*--------------------------------------------------------------
 * https://discordapp.com/oauth2/authorize?client_id=[CLIENT_ID_HERE]&scope=bot&permissions=1879436534
 **************************************************************/

/***************************************************************
 *                       REQUIRES
 **************************************************************/
const fs = require("fs");
const Discord = require('discord.js');
const config = require("./config/config.json");
const fileops = require("./lib/fileaccess.js");
const replies = require("./config/replies.json");

/***************************************************************
 *                       OBJECT SETUP
 **************************************************************/
const client = new Discord.Client();
const commands = new Discord.Collection();
const events = new Discord.Collection();

/***************************************************************
 *                       ASSIGNMENTS
 **************************************************************/
fileops.LoadSettings();
let settings = fileops.Settings;
fileops.LoadCommands(commands);
//For passing objects to functions
let core = {
    client:client,
    settings: settings
};
const token = process.env.DISCORD_BOT_SECRET;

/***************************************************************
 *                       EVENT HANDLERS
 **************************************************************/
//On connection to Discord.
client.once('ready', () => {
    console.log('Ready!');
});

//On message received in channel where bot is listening. Command handler
client.on("message", (message) => {
    //We must have a prefix, or the msg is from the bot itself
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    //Get the args, space separated.
    const args = message.content.slice(config.prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    //Check the command (first arg) against the command list, 
    //and if unrecognized, bail out.
    if (!commands.has(commandName)) return;

    const command = commands.get(commandName);

    try {
        //Commands have matching modules, so we will execute the command
        //  based on the name of the command matching a command in the .commands
        //  directory, which was parsed via the FileOps.LoadCommands function
        console.log(`Command ${commandName} issued by ${message.author.username} with args ${args}`);
        command.execute(message, args, settings);
    } catch (e) {
        console.log(`\nError occured:\nUser: ${message.author.username}\nChannel: ${message.channel.name}\nCommand: ${commandName}\nArgs: ${args}\nError: ${e}\n`);
       message.channel.send(`Oops! That command didn't work! Usage is ${command.usage}`);
    }
});

//On ALL commands. Used to handle interaction with older reactions
client.on("raw", async event=>{

    //console.log(`Event ${event.t}`);

    if (event.t === "MESSAGE_REACTION_ADD" || event.t === "MESSAGE_REACTION_REMOVE")
    {
        //Handle Lobby functionality.
        if (event.d.message_id === settings.lobby.messageID){
            let cmdLobby = commands.find(n=>n.name === "lobby");
            cmdLobby.HandleLobbyReaction(core, event);
        }
    }
    else if(settings.auditEvents.hasOwnProperty(event.t)){
        if (settings.outputChannel.level.toLowerCase() !== "none"){
            let cmdAudit = commands.find(n=>n.name === "auditlog");
            cmdAudit.LogAudit(core, event);
        }
    }
});

//Login to Discord
client.login(token);