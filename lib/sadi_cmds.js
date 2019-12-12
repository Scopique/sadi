const fs = require("fs");
const discord = require("discord.js");
const utils = require("./sadi_utilities.js");

module.exports = {
  QueryShipsByName:function(search)
  {
    var _json = JSON.parse(fs.readFileSync("./scdata/ships.json"));
    return utils.GetNodeObjects(_json,"name",search);
  },
  QueryShipsByType:function(search){
    var _json = JSON.parse(fs.readFileSync("./scdata/ships.json"));
    return utils.GetNodeObjects(_json,"type",search);
  },
  QueryShipsByRole:function(search){
    var _json = JSON.parse(fs.readFileSync("./scdata/ships.json"));
    return utils.GetNodeObjects(_json,"focus",search);
  },
  QueryShipsByPrice:function(searchMin, searchMax)
  {
    var _json = JSON.parse(fs.readFileSync("./scdata/ships.json"));
    return utils.GetNodeObjectsRange(_json,"type",searchMin, searchMax);
  },
  QueryShipsBySize:function(search)
  {
    var _json = JSON.parse(fs.readFileSync("./scdata/ships.json"));
    return utils.GetNodeObjects(_json,"size",search);
  },
  QueryShipsByMfr:function(search)
  {
    var _json = JSON.parse(fs.readFileSync("./scdata/ships.json"));
    return utils.GetNodeObjects(_json,"manufacturer",search);
  },
  QuerySystemsByName:function(search)
  {
    var _json = JSON.parse(fs.readFileSync("./scdata/systems.json"));
    return utils.GetNodeObjects(_json,"name",search);
  },
  QuerySystemObjectsBySystem:function(search)
  {
    var _json = JSON.parse(fs.readFileSync("./scdata/systems.json"));
    return utils.GetNodeObjects(_json,"name",search);
  },
  QueryObjectsByName:function(search)
  {
    var _json = JSON.parse(fs.readFileSync("./scdata/objects.json"));
    return utils.GetNodeObjects(_json,"name",search);
  }

}