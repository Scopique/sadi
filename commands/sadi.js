/***************************************************************
 *                       SADI
 *  Although the WHOLE BOT is SADI, this command module handles
 * direct interaction with the bot. Most of this handles help
 * stuff, although SADI can be used for other operations that
 * might be useful, like looking up in-game resources at 
 * locations, and ship info, if we can latch onto an API.
 **************************************************************/

const {success:_success, error:_error, special:_special, reactions:_reactions, sadi:_sadi} = require("../config/replies.json");
const shipCmd = require("../lib/sadi_cmds_ships.js");
var shipEmbeds = [];

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
    else if (args.length >= 2)
    {
      /*
      We have several formats for ship queries. 
      !sadi -[?]n [criteria] where -[?] can be
        -n: name
        -m: manufacturer
        -r: role
        -z: size
      We can also just query by name using !sadi ship [NAME]
      */


      //info, myships, and shipname with relevant follow-up arg.
      switch(args[0].toLowerCase()){
        case "info":
          message.channel.send(_error.not_yet_implemented);
          break;
        case "myships":
          message.channel.send(_error.not_yet_implemented);
          break;
        case "ship":
        case "-n":
        case "-m":
        case "-r":
        case "-z":
          //message.channel.send(_error.not_yet_implemented);
          var _json = null;
          switch(args[0].toLowerCase()){
            case "ship":
            case "-n":
              _json = shipCmd.QueryShipsByName(args[1]);
              break;
            case "-m":
              _json = shipCmd.QueryShipsByMfr(args[1]);
              break;
            case "-r":
              _json = shipCmd.QueryShipsByRole(args[1]);
              break;
            case "-z":
              _json = shipCmd.QueryShipsBySize(args[1]);
              break;
          }
          ShipDisplay(_json, message);
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

//https://discordjs.guide/popular-topics/embeds.html#local-images-2
function ShipDisplay(json, message)
{
  if (json != null){
    //If the json has multiple objects, we need to include
    //the reaction footer. Otherwise, we can just pin the
    //  data there and be done. 
    if (json.length > 0){
      var _data = json[0];
      var _mbed = {
        color: 0x0099ff,
        title: _data.name,
        description: _data.description,
        thumbnail: { url: process.env.RSI_BASE_URI + _data.logo },
        image: { url:process.env.RSI_BASE_URI + _data.banner },
        fields:[
          {name:"Status", value:_data.production_status, inline: true},
          {name:"Role", value:_data.focus, inline: true},
          {name: "\u200b", value: "\u200b"},
          {name:"Max Crew", value:_data.crew.split("/")[1], inline: true},
          {name:"Max Cargo", value:_data.cargocapacity == null ? "0": _data.cargocapacity, inline: true},
          {name:"Size", value:_data.size, inline: true},
        ],
        footer: {
          text:"Data courtesy of starcitizen-api.com"
        }
      }
      message.channel.send({embed:_mbed})
      .then(sent=>sent.react(_reactions.previous)
        .then(()=>sent.react(_reactions.next)));
    }else{
      message.channel.send("Sorry! That ship was not found.")
    }
  }else{
    message.channel.send("Sorry! That ship was not found.")
  }
}