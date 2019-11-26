/***************************************************************
 *                STAR CITIZEN API ACCESS
 * https://starcitizen-api.com/startup.php
 * Used with sadi.js
 **************************************************************/
const fetch = require("node-fetch");
const ships = require("../config/ships.json");
const shipsAPI = process.env.SC_API_SHIPS_URI;  //Contains the API key to lookup via cache
const discord = require("discord.js");
const {success:_success, error:_error, special:_special, reactions:_reactions, sadi:_sadi} = require("../config/replies.json");

var _variantIdx = 0;
var _lastShip = null;

module.exports = {
  GetShip: function(shipName, message){
    var _findShip = NormalizeShipName(shipName);
    const _shipURI = shipsAPI + `?name=${encodeURIComponent(_findShip)}`;

    const json = fetch(_shipURI)
      .then(res=>res.json())
      .then(json=>{
        ParseShipData(json, message);
      })
      .catch(err=>{
        message.channel.send(_sadi.ship_error)
        console.log(err)
      });
  }
}

function ParseShipData(json, message){
  if (json.message == "ok" && Object.keys(json.data).length > 0){
    
    const _mfr = json.data[0].manufacturer;
    const _media = json.data[0].media;

    const _shipName = json.data[0].name;
    const _shipDesc = json.data[0].description;
    const _shipStatus = json.data[0].production_status;
    const _shipRole = json.data[0].focus;
    const _maxCrew = json.data[0].max_crew;
    const _maxCargo = json.data[0].cargocapacity == null ? "0" : json.data[0].cargocapacity
    const _storeURL = `${process.env.RSI_BASE_URI}${json.data[0].url}`;

    const _mfrThumb = _mfr == undefined ? "" : _mfr.media[0].source_url.includes("http") ? `${_mfr.media[0].source_url}` : `${process.env.RSI_BASE_URI}${_mfr.media[0].source_url}`;
    const _shipImg = _media == undefined ? "" : _media[0].images.hub_large.includes("http") ? `${_media[0].images.hub_large}` : `${process.env.RSI_BASE_URI}${_media[0].images.hub_large}`;

    const _shipInfo = new discord.RichEmbed()
      .setColor('#0099ff')
      .setTitle(_shipName)
      .setURL(_storeURL)
      .setDescription(_shipDesc)
      .setThumbnail(_mfrThumb)
      .addBlankField(true)
      .addField('Status', _shipStatus, true)
      .addField('Role', _shipRole, true)
      .addBlankField(true)
      .addField('Max Crew', _maxCrew, true)
      .addField('Max Cargo', _maxCargo, true)
      .setImage(_shipImg)
      .setTimestamp()
      .setFooter('Data courtesy of starcitizen-api.com');
    message.channel.send(_shipInfo);
  }else{
    console.log("Data unavailable");
    message.channel.send(_sadi.no_ship)
  }
}


/*##################################################################################
* NormalizeShipName(raw)
* raw: the ship name that the user wants to search for
* returns: A ship name that StarCitizen-API will recognize
* 
* config/ships.json contains a JSON representation of all ships pulled from 
*   StarCitizenAPI, reformatted to organize by model and variant. 
* We are ASSUMING that people will search for the major name of the ship, like
*   Constellation or Aurora, and not the actual name like Constellation Aquila or
*   Aurora ES. 
* This cycles through the ship JSON and matches the model to a node in the list.
* If that node has variants, we get the NEXT item in the index, which is a rolling
*   tracker based on the current model. If the model changes mid-stream, the index
*   count is reset. So first Aurora search returns the ES, second returns the LX, 
*   third returns the MR, and so on. We do not do wildcard searches.
*
* There is ONE outlier -- currently -- that we have to trap for, and that's the 
*   Hornet. This ship is named by it's variant FIRST, then the model. We need to
*   swap those positions around if they are looking for that ship. Hopefully this is
*   the only one that behaves like this. 
##################################################################################*/
function NormalizeShipName(raw){
  var _findShip = "";
  var _model = "";
  var _variant = "";

  if (raw.includes("-") || raw.includes("_"))
  {
    raw = (raw.replace("-", " ").replace("_", " ")).split(" ")[0];
  }

  try{
    for(var i = 0; i < Object.keys(ships).length; i++){
      var _variantLen = Object.keys(ships[i]["variants"]).length;
      if (ships[i]["model"].toLowerCase() == raw.toLowerCase())
      {
          _model = ships[i]["model"];
          
          if (_variantLen > 0 && _variantIdx < _variantLen)
          {
              _variant = ships[i]["variants"][_variantIdx];
              if (_variantIdx <= _variantLen) { _variantIdx++; } else {_variantIdx = 0; };
          }
      }
      else if (_variantLen > 0)
      {
          for(var v = 0; v < _variantLen; v++)
          {
              if(ships[i]["variants"][v].toLowerCase() == raw.toLowerCase()){
                  _model = ships[i]["model"];
                  _variant = ships[i]["variants"][v];
                  break;
              }
          }
      }

      if ((_model != "" && _variant != "") || _model !="")
      {
          //Deal with the obnoxious Hornet
          var _suffix = "";
          if (_model.toLowerCase() == "hornet")
          {
              if (_variant.includes("|"))
              {
                  _findShip = _variant.split("|")[0] + " " + _model + " " + _variant.split("|")[1];
              }else{
                  _findShip = _variant + " " + _model;
              }
          }else{
              _findShip = _model + " " + _variant;
          }
          
          break;
      }
    }
  }catch(err){
    console.log(`Raw: ${raw}\nLastShip: ${_lastShip}\nvariant IDS: ${_variantIdx}\n\n${err}`);
  }
  
  return _findShip;
  
}
