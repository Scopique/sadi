/***************************************************************
 *                       SADI
 *  Although the WHOLE BOT is SADI, this command module handles
 * direct interaction with the bot. Most of this handles help
 * stuff, although SADI can be used for other operations that
 * might be useful, like looking up in-game resources at 
 * locations, and ship info, if we can latch onto an API.
 **************************************************************/

const {success:_success, error:_error, special:_special, reactions:_reactions, sadi:_sadi} = require("../config/replies.json");
const sadiCmd = require("../lib/sadi_cmds.js");
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
      if (args[0] == "?")
      {
          message.channel.send(_sadi.cmd_help);
      }else{
        //Calendar, basically, which should pull the next week or two of events from
        //whatever database or textfile this connects to. 
        message.channel.send(_error.not_yet_implemented);
      }
    }
    else if (args.length >= 2)
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
        case "-n":
        case "-m":
        case "-r":
        case "-t":
          //message.channel.send(_error.not_yet_implemented);
          var _json = null;
          switch(args[0].toLowerCase()){
            case "ship":
            case "-n":
              _json = sadiCmd.QueryShipsByName(args[1]);
              break;
            case "-m":
              _json = sadiCmd.QueryShipsByMfr(args[1]);
              break;
            case "-r":
              _json = sadiCmd.QueryShipsByRole(args[1]);
              break;
            case "-t":
              _json = sadiCmd.QueryShipsByType(args[1]);
              break;            
          }
          ShipDisplay(_json, message);
          break;
        case "-s":
        case "system":
          if (args[1].indexOf("-") == 0)
          {
            switch(args[1]){
              case "-o":
                //Args[0] is -s and args[1] is -o, so 
                //  args[2] is the system name.
                _json = sadiCmd.QuerySystemObjectsBySystem(args[2]);
                SystemObjectListDisplay(_json, args[2], message);
                break;
            }

          }else{
            _json = sadiCmd.QuerySystemsByName(args[1]);
            SystemDisplay(_json, message);
          }
          
          break;
        case "-o":
        case "object":
          _json = sadiCmd.QueryObjectsByName(args[1]);
          SystemObjectDisplay(_json, message);
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
    if (json.length > 0){
      var _varients="| ";
      if (json.length > 1)
      {
        json.forEach(ship=>{
          _varients += ship.name + " | ";
        });
      }else{
        _varients = "None";
      }

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
          {name:"Type", value:_data.type, inline: true},

          {name:"Max Crew", value:_data.crew.split("/")[1], inline: true},
          {name:"Max Cargo", value:_data.cargocapacity, inline: true},
          {name:"Size", value:_data.size, inline: true},
          
          {name:"Varients", value:_varients}
        ],
        footer: {
          text:"Data courtesy of starcitizen-api.com"
        }
      }
      message.channel.send({embed:_mbed});
    }else{
      message.channel.send("Sorry! That ship was not found.")
    }
  }else{
    message.channel.send("Sorry! That ship was not found.")
  }
}

function SystemDisplay(json, message)
{
  if (json != null){
    if (json.length > 0){
      var _data = json[0];   

      var _gates = "| ";
      if (_data.gates.length>0){
        _data.gates.forEach(gate=>{_gates += gate.designation + " | "});
      }else{
        _gates = "[UNKNOWN]";
      }
      
      const _objCnt = new Set(_data.objects).size;
      var _objects = `${_objCnt} objects found in the ${_data.name} system.\nUse '!sadi -s -o [SYSTEM] for a list.`;

      var _mbed = {
        color: 0x0099ff,
        title: _data.name,
        description: _data.description,
        image: { url:_data.img },
        fields:[
          {name:"Affiliation", value:_data.affiliation, inline: true},
          {name:"Type", value:_data.type, inline: true},
          {name:"Gates", value:_gates},
          {name:"Objects", value:_objects},
        ],
        footer: {
          text:"Data courtesy of starcitizen-api.com"
        }
      }
      message.channel.send({embed:_mbed});
    }else{
      message.channel.send("Sorry! That system was not found.")
    }
  }else{
    message.channel.send("Sorry! That system was not found.")
  }
}

function SystemObjectListDisplay(json, parent, message)
{
  if (json != null){
    var _fields = [];
    json[0].objects.forEach(obj=>{
      var _name = obj.subtype == obj.classification ? obj.subtype : obj.subtype + " - " + obj.classification;
      var _value = obj.name == obj.designation ? obj.name : obj.name + " (" + obj.designation + ")";
      var _obj = {
        id:obj.id,
        name:`${_name}`,
        value:`${_value}`
      }

      const _inArray = _fields.some(itm=>itm.id === obj.id);

      if (!_inArray){
        _fields.push(_obj)
      }

    });
    var _mbed = {
        color: 0x0099ff,
        title: `Objects in the ${parent} system`,
        fields:_fields,
        footer: {
          text:"Data courtesy of starcitizen-api.com"
        }
      }
      message.channel.send({embed:_mbed});
  }else{
    message.channel.send("Sorry! No objects were found.");
  }
}

function SystemObjectDisplay(json, message){
  if (json != null){
    if (json.length > 0){
      var _data = json[0];   

      var _mbed = {
        color: 0x0099ff,
        title: _data.name,
        description: _data.description,
        fields:[
          {name:"Designation", value:_data.designation, inline: true},
          {name:"Type", value:_data.type, inline: true},
          {name:"Classification", value:_data.classification, inline:true}
        ],
        footer: {
          text:"Data courtesy of starcitizen-api.com"
        }
      }
      message.channel.send({embed:_mbed});
    }else{
      message.channel.send("Sorry! That system was not found.")
    }
  }else{
    message.channel.send("Sorry! That system was not found.")
  }
}