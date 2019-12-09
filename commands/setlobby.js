/***************************************************************
 *                       SETLOBBY
 * The LOBBY idea is to corral new users in a specific channel
 * until they ACCEPT the EULA by clicking a checkmark emoji. 
 * When they do, they are granted a new role which has permission
 * to see other channels on the server. If the REJECT the EULA
 * they are kicked from the server. 
 * 
 * The !setlobby command can be used to specify the channel and
 * the role to grant on acceptance. The admin must make sure that
 * this channel exists and is only open to @everyone. The admin
 * must also ensure that the role to be granted exists, and that
 * at bare minimum has permission to see and read history for 
 * whatever other channels the admin decides a new user should see.
 **************************************************************/
const {success:_success, error:_error, special:_special, reactions:_reactions, sadi:_sadi} = require("../config/replies.json");
const db = require("../lib/dbregistration.js")

module.exports={
    name: "lobby",
    cmd:"setlobby",
    description:"Requires new users arriving via invite link to agree to the server EULA before accessing the server.",
    args:false,
    usage:"[Channel_Name][Role_To_Grant] | reset | remove",
    execute(message, args, core){
      const {client:client, settings:settings} = core;
        //0 args will print the usage
        //1 arg is either rebuild or remove
        //2 args is assignment
        //2+ args is wrong
        if (args.length == 0){
          message.channel.send("[Channel_Name][Role_To_Grant] | reset | remove");
        }
        else if (args.length == 1)
        {
          if(args[0] == "?")
          {
            message.channel.send("!setlobby [Channel_Name][Role_To_Grant] | reset | remove");
          }else{
            const _lobby = message.guild.channels.find(c=>c.id === settings.lobby.channelID);
            if (_lobby != null){
                switch(args[0].toLowerCase())
                {
                    case "remove":
                        DeleteLobby(_lobby, settings, message.author);
                        break;
                    case "reset":
                        ResetLobby(_lobby, settings, message.author);
                        break;
                    case "help":
                        message.send("Help is on the way!...Eventually.");
                        break;
                    default:
                        //No recognizable command
                        throw "Bad arguments";
                        break;
                }
            }else{
                message.channel.send(_error.no_lobby_defined);
            }
          }
        }
        else if (args.length == 2)
        {
            //Ensure we have the channel and role
            const _lobby = message.guild.channels.find(c=>c.name.toLowerCase() === args[0].toLowerCase());
            const _newRole = message.guild.roles.find(r=>r.name.toLowerCase() === args[1].toLowerCase());
            
            if (_lobby !== "" && _newRole !== "")
            {
                //console.log(_lobby);
                //Save settings
                settings.lobby.channelID = _lobby.id;
                settings.lobby.channelName = args[0];
                settings.lobby.acceptRoleID = _newRole.id;
                settings.lobby.acceptRole = args[1];

                //Msg to delete is in the SETTINGS object.
                DeleteMessage(_lobby, settings, message.author)
                //Add the new message. We do this after SETTINGS
                //because of the promise when adding a message is async
                //and cannot return the new message ID in time.
                AddMessage(_lobby, settings, message.author);                
            }else{
                message.channel.send(_error.missing_channel + " " + _error.missing_role);
            }
        }
        else
        {
            message.channel.send(_error.too_many_args);
        }
    },
    async HandleLobbyReaction(core, event)
    {
        const {d:data} = event;
        const {client:client, settings:settings} = core;

        const channel = client.channels.get(data.channel_id) || await user.createDM();
        const message = await channel.fetchMessage(data.message_id);
        
        const user = client.users.get(data.user_id);    //Who clicked it?
        const guild = client.guilds.get(data.guild_id); //Need to ID the current server, in case this is a custom emote? Or do emote IDs differ between servers?
        
        let reaction = message.reactions.get(data.emoji.name);
        if (!reaction) {
            const emoji = new Discord.Emoji(guild, data.emoji);
            reaction = new Discord.MessageReaction(message, emoji, 1, data.user_id === client.user.id);
        }
        
        switch (event.t)
        {
            case "MESSAGE_REACTION_ADD":
                //Add: Accept or Reject
                if ((reaction.emoji.name === _reactions.accept) &&!user.bot) {
                    try{
                        let okUser = message.guild.members.get(user.id);       
                        okUser.addRole(settings.lobby.acceptRoleID);  
                        console.log(`${user.username} was granted the ${settings.lobby.acceptRole} role`);
                        //DM them something welcoming them to the server. Should be configurable by the admin somehow.

                        //Add them to the database
                        db.MemberRegister(message.guild.id, okUser)
                        .then(rslt=>console.log(rslt));

                      const _newDM = okUser.createDM();
                      _newDM.then((ch)=>{
                        ch.send(_sadi.welcome_dm);
                      })
                      .catch((err)=>{console.log(err)});


                    }catch (ex)
                    {
                        console.log(ex);
                    }
                }
                else if((reaction.emoji.name === _reactions.reject) && !user.bot){
                    let okUser = message.guild.members.get(user.id);
                    //Write this to a logging channel, if one is supplied.
                    console.log(`${user.username} was kicked for not accepting the EULA`);
                }
                break;
            case "MESSAGE_REACTION_REMOVE":
                //If the user opts to remove his or her click...no one cares
                //No user can remove the emoji because the bot put it there. 
                //Problem is...should the user be able to revoke his/her own role this way?
                break;
        }
    }
}

//Remove the message that matches the message we'll be adding.
function DeleteMessage(lobby, settings)
{
    if (settings.lobby.hasOwnProperty("messageID"))
    {
        const _msgID = settings.lobby.messageID;
        if (_msgID.length > 0){
          try{
            lobby.fetchMessage(_msgID).then(msg=> msg.delete());
          }catch(err){
            
          }
        }
    }
}

//Add the message and the reactions
async function AddMessage(lobby, settings)
{
     lobby.send(_special.eula_accept).then(
        sent=> {sent.react(_reactions.accept).then(
                ()=>sent.react(_reactions.reject).then(
                    () => settings.lobby.messageID = sent.id
                ));
        }
    );
}

function DeleteLobby(lobby, settings)
{
    DeleteMessage(lobby, settings);
    settings.lobby = {};
}

function ResetLobby(lobby,  settings)
{
    DeleteMessage(lobby, settings);
    AddMessage(lobby, settings);
}

//https://pastebin.com/Bs8g8BnK
//https://www.npmjs.com/package/reaction-core
//https://darrenderidder.github.io/talks/ModulePatterns/#/9
//https://gist.github.com/Lewdcario/52e1c66433c994c5c3c272284b9ab29c
//https://github.com/Sam-DevZ/Discord-RoleReact/blob/master/roleReact.js