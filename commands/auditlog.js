/***************************************************************
 *                       SETOUTPUT
 * Admins can specify a channel for the bot to log all kinds of
 * information to. Using !setoutput [CHANNEL_NAME] will allow the
 * bot to post notifications at levels which the admin can 
 * specify with additional arguments. 
 * -------------------------------------------------------------
 * Additional Arguments
 *      NONE: Suppress all messages to that channel
 *      DEBUG: Errors that would normally go to the console
 *      INFO: All command result output
 **************************************************************/
const {success:_success, error:_error, special:_special, reactions:_reactions} = require("../config/replies.json");
const Discord = require("discord.js");
const client = new Discord.Client();

module.exports={
    name: "auditlog",
    cmd:"setauditlog",
    description: "Designates a channel to receive bot audit messages specified by level.",
    args: true,
    usage: "[CHANNEL_NAME] none | debug | info",
    execute(message, args, settings){
        const _output = message.guild.channels.find(c=>c.name.toLowerCase() === args[0].toLowerCase());
        if (_output !== "")
        {
            if (args[1].toLowerCase() === "none")
            {
                settings.outputChannel.id = ""
                settings.outputChannel.level = "";
            }else{
                settings.outputChannel.id = _output.id;
                settings.outputChannel.level = args[1];
            }
            
            console.log(`Audit channel ${args[0]} at level ${args[1]} set OK.`);
        }else{
            message.channel.send(_error.missing_channel);
        }
    },
    async LogAudit(core, event)
    {
        //When we have an audit event, the message is passed in here and we'll deal with
        //formatting and sending to the appropriate logging channel, if one is defined. 
        const {d:data} = event;
        const {client:client, settings:settings} = core;
        const _guild = client.guilds.get(`${data.guild_id}`);
        
        const _entry = await _guild.fetchAuditLogs({type: `${event.t}`}).then(audit => audit.entries.first())
        /*
        targetType: user
        actionType: update
        action: member_role_update  (So more granular)
        reason: null   (kick and ban reasons)
        executor.User: {}  (bunch of stuff on who did the thing)
        changes:[{key:'', old:..., new: []}]    (Might be able to parse NEW to get the specifics)
        target:.User: {}   (Like executor, but who the action was done TO)
        console.log(_entry);
        */

        
    }
}