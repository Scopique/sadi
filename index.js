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
const keep_alive = require('./keep_alive.js')
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

client.on('guildCreate', (guild)=>{
  //Do something when the bot is added to a new guild.
});

//On message received in channel where bot is listening. Command handler
client.on("message", (message) => {
    //We must have a prefix, or the msg is from the bot itself
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    //Get the args, space separated.
    //const args = message.content.slice(config.prefix.length).split(/ +/);
    const args = parseCmd(message.content.slice(config.prefix.length));
    const commandName = args.shift().toLowerCase();

    //Check the command (first arg) against the command list, and if unrecognized, bail out.
    if (!commands.has(commandName)) return;
    const command = commands.get(commandName);

    try {
        console.log(`Command ${commandName} issued by ${message.author.username} with args ${args}`);
        command.execute(message, args, core);
    } catch (e) {
        console.log(`\nError occured:\nUser: ${message.author.username}\nChannel: ${message.channel.name}\nCommand: ${commandName}\nArgs: ${args}\nError: ${e}\n`);
       message.channel.send(`Oops! That command didn't work! Usage is ${command.usage}`);
    }
});

client.on("guildMemberUpdate", function(oldData, newData){
  // const removedRoles = oldData.roles.filter(role => !newData.roles.has(role.id));
  // if(removedRoles.size>0){ removedRoles.forEach(role=>db.RemoveRole(role.guild.id, oldData.user.id, role.id))}

  // const addedRoles = newData.roles.filter(role =>!oldData.roles.has(role.id));
  // if(addedRoles.size>0){ addedRoles.forEach(role=>db.AssignRole(role.guild.id, oldData.user.id, role.id))}
});

client.on("guildMemberAdd", function(mbr){
  
})

client.on("guildMemberRemove", function(mbr){
  
})

//On ALL commands. Used to handle interaction with older reactions
client.on("raw", async event=>{

    //console.log(`Event ${event.t}`);

    if (event.t === "MESSAGE_REACTION_ADD" || event.t === "MESSAGE_REACTION_REMOVE")
    {
        //Handle Lobby functionality.
        if (event.d.message_id === settings.lobby.messageID){
            let cmdLobby = commands.find(n=>n.name === "lobby");
            cmdLobby.HandleLobbyReaction(core, event);
        }else{
          //This will fire for ANY reaction interaction that doesn't happen inside the lobby
          //We somehow need to determine if this message is an embed with cycle reactions
        }
    }
    else if(event.t === "GUILD_MEMBER_UPDATE"){

    }
    else if(settings.auditEvents.hasOwnProperty(event.t)){
        // if (settings.outputChannel.level.toLowerCase() !== "none"){
        //     let cmdAudit = commands.find(n=>n.name === "auditlog");
        //     cmdAudit.LogAudit(core, event);
        // }
    }
});

//Login to Discord
client.login(token);

//Allow for the use of command criteria with spaces, assuming
//that quotes are used. Can use " or ' or `
function parseCmd(cmd){
  var args = [];
  if (cmd.includes('\"'))
    {
      //!sadi,,-n,,mustang alpha"
      args = cmd.split(/\s(?=(?:[^'"`]*(['"`])[^'"`]*\1)*[^'"`]*$)/g)
      .map(el=>el.replace("\"", ""))
      .map(el=>el.replace("\"", ""))
      .filter(el=>{return el.length > 0});
    }else{
      args = cmd.split(/ +/);
    }
  return args
}