/***************************************************************
 *                       SADI
 *  Although the WHOLE BOT is SADI, this command module handles
 * direct interaction with the bot. Most of this handles help
 * stuff, although SADI can be used for other operations that
 * might be useful, like looking up in-game resources at 
 * locations, and ship info, if we can latch onto an API.
 **************************************************************/
const {success:_success, error:_error, special:_special, reactions:_reactions, sadi:_sadi} = require("../config/replies.json");

module.exports={
  name:"sadi",
  cmd:"sadi",
  description:"Get help from S.A.D.I.",
  args: false,
  usage: "!sadi [COMMAND]",
  execute(message, args, core){   
    /*
    [info] POLICIES | MEMBERS | EVENTS | AFFILIATION | COMMANDS
    [myships] VIEW | ADD | REMOVE
    [calendar]
    [ship] SHIPNAME
    */
    if (args.length == 0) {
      //No args, so SADI should just say hello. Maybe give the time and SC Date (29xx)
    }
    else if (args.length == 1) {
      //Calendar, basically, which should pull the next week or two of events from
      //whatever database or textfile this connects to. 
      message.channel.send(_error.not_yet_implemented);
    }
    else if (args.length == 2)
    {
      //info, myships, and shipname with relevant follow-up arg.
      switch(args[0].toLowerCase()){
        case "info":
          message.channel.send(_error.not_yet_implemented);
          break;
        case "myships":
          message.channel.send(_error.not_yet_implemented);
          break;
        case "ship":
          message.channel.send(_error.not_yet_implemented);
          break;
        case "system":
          message.channel.send(_error.not_yet_implemented);
          break;
        default:
          break;
      }
    }
  }
}
 