const fs = require("fs");
const discord = require("discord.js");
const utils = require("./sadi_utilities.js");

module.exports = {
  QueryShipsByName:function(search)
  {
    var _shipJson = JSON.parse(fs.readFileSync("./scdata/shipsMaster.json"));
    return utils.GetNodeObjects(_shipJson,"name",search);
  },
  QueryShipsByType:function(search){
    var _shipJson = JSON.parse(fs.readFileSync("./scdata/shipsMaster.json"));
    return utils.GetNodeObjects(_shipJson,"type",search);
  },
  QueryShipsByRole:function(search){
    var _shipJson = JSON.parse(fs.readFileSync("./scdata/shipsMaster.json"));
    return utils.GetNodeObjects(_shipJson,"focus",search);
  },
  QueryShipsByPrice:function(searchMin, searchMax)
  {
    var _shipJson = JSON.parse(fs.readFileSync("./scdata/shipsMaster.json"));
    return utils.GetNodeObjectsRange(_shipJson,"type",searchMin, searchMax);
  },
  QueryShipsBySize:function(search)
  {
    var _shipJson = JSON.parse(fs.readFileSync("./scdata/shipsMaster.json"));
    return utils.GetNodeObjects(_shipJson,"size",search);
  },
  QueryShipsByMfr:function(search)
  {
    var _shipJson = JSON.parse(fs.readFileSync("./scdata/shipsMaster.json"));
    return utils.GetNodeObjects(_shipJson,"manufacturer",search);
  }
}