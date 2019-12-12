const fetch = require("node-fetch");
const scapi = require("../lib/scapi");
const cmdShips = require("../lib/sadi_cmds_ships.js");

const shipsAPI = process.env.SC_API_SHIPS_URI;  //Contains the API key to lookup via cache

module.exports = {
    name:"test",
    cmd:"test",
    description:"Use for running tests",
    execute( message, args, core)
    {
      const {client: client, settings, setting} = core;
      // console.log(shipsAPI);
      //  const _json = fetch(shipsAPI)
      //   .then(res=>res.json())
      //   .then(json=>parse(json));

      //scapi.RefreshAPIData();
      scapi.CleanFiles();
      //scapi.RefreshMasterData();
      //scapi.RefreshMasterData();
      //cmdShips.QueryShipsByMfr("RSI");
    }  
}

function parse(json){
  console.log("Parse started...");
  var _cnt1 = 0;
  var _cnt2 = 0;
  var _cnt3 = 0;

  var _shipsMain = [{}];
  var _subNames = [{}];

  // for(var i = 0; i< json.data.length; i++){
  //   var _fullName = json.data[i].name;
  //   var _fName = _fullName.split(' ')[0];
  //   _shipsMain[_fName] = [{}];
  //   _cnt1++;
  // }

  var _lastShip = '';
  for(var i = 0; i < json.data.length; i++){
    
    var _fullName = json.data[i].name;
    var _first = _fullName.split(' ')[0];
    
    //Do we have this first name in the collection?
    if (_shipsMain[_first]!=null){
      
    }
  }
  console.log(`${_cnt1} ships from JSON.`);

  console.log(`${_cnt2} ship secondary names.`);

}

function MyIP()
{
  var os = require('os');
  var ifaces = os.networkInterfaces();

  Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }

      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        console.log(ifname + ':' + alias, iface.address);
      } else {
        // this interface has only one ipv4 adress
        console.log(ifname, iface.address);
      }
      ++alias;
    });
  });
}

function makeBaseSettings()
{
    let newSettings = {};
    newSettings.saveSettingsInterval = 60000;
    newSettings.lobby = {};
    newSettings.lobby.channelID = "";
    newSettings.lobby.channelName = "";
    newSettings.lobby.acceptRoleID = "";
    newSettings.lobby.acceptRole = "";
    //Add additional levels and layers here.
    return newSettings;
}