const fetch = require("node-fetch");
const db = require('../lib/dbaccess.js');
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

      //MyIP();
      const _guild = message.guild;
      db.GuildRegister(_guild);
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

  // Object.keys(_ships).forEach(function(k){
  //   console.log(k + " - " + obj[k]);
  // });


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

function DBTest() {
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host     : 'scopique.com',
    user     : 'scopiq6_sadi_admin',
    password : 'k95o^HjAvYrqzHvu',
    database : 'scopiq6_sadi_bot'
  });

  connection.connect();

  connection.query('SELECT * from db_test', function (error, results, fields) {
    if (error) throw error;
    var _resCnt = Object.keys(results).length;
    //console.log(_resCnt);
    for(var i = 0; i < _resCnt; i++){
      console.log(`ID is ${results[i]["ID"]} and the value is '${results[i]["Value"]}'`);
    }
  });

  connection.end();
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