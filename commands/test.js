const fetch = require("node-fetch");
const shipsAPI = process.env.SC_API_SHIPS_URI;  //Contains the API key to lookup via cache

module.exports = {
    name:"test",
    cmd:"test",
    description:"Use for running tests",
    execute( message, args, settings)
    {
      console.log(shipsAPI);
       const _json = fetch(shipsAPI)
        .then(res=>res.json())
        .then(json=>parse(json));
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