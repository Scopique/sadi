/***************************************************************
 *                STAR CITIZEN API ACCESS
 * https://starcitizen-api.com/startup.php
 * Used with sadi.js
 **************************************************************/
const fetch = require("node-fetch");
const shipsAPI = process.env.SC_API_SHIPS_URI;  //Contains the API key to lookup via cache

var _idx = 0;
var _lastShip = null;

module.exports = {
  GetShip: function(shipName){
    //So the ship name is going to be dicey. We can search by name, 
    //but if they fat-finger it or only provide part of the name, 
    //what do we do?
    var _findShip = NormalizeShipName(shipName);

    const _shipURI = shipsAPI + `?name=${encodeURIComponent(_findShip)}`;
    //console.log(_shipURI);
    // const json = fetch(_shipURI)
    //   .then(res=>res.json())
    //   .then(json=>ParseShip(json));
    
    
  }
}

function NormalizeShipName(raw){
  //If we are passed a partial ship name, we need to get the nth
  //  instance, where nth is last index of the model + 1. If that
  //  would roll over to an undefined, we revert back to 0.

  //First, though, see if we can pull up a record from _shipList;
  var _ships = _shipList[raw];
  if (_ships != null){
    var _modelCnt = _ships[0].length;
    var _model = _ships[_idx];
    var _findShip = raw + " " + _model;

    if (_lastShip == raw || _idx == 0)
    {
      console.log(_idx + " < " + _modelCnt);
      if (_idx < _modelCnt) { 
        _idx++;
      } else { 
        _idx = 0;
      }
    }else{
      _idx = 0;
    }
    _lastShip = raw;
  }else{
    _findShip = null;
    console.log(`Sent in ${raw} but found no match`);
  }

  return _findShip;
}

async function ParseShip(json){
  
}


const _shipList = {
	"890": {
		"0": "Jump"
	},
	"Aurora": {
		"0": "ES",
		"1": "LX",
		"2": "MR",
		"3": "CL",
		"4": "LN"
	},
	"300i": {},
	"315p": {},
	"325a": {},
	"350r": {},
	"Hornet": {
		"0": "F7C",
		"1": "F7C",
		"2": "F7C-S",
		"3": "F7C-R",
		"4": "F7C-M",
		"5": "F7A",
		"6": "F7C-M"
	},
	"Constellation": {
		"0": "Aquila",
		"1": "Andromeda",
		"2": "Taurus",
		"3": "Phoenix",
		"4": "Phoenix"
	},
	"Freelancer": {
		"0": "DUR",
		"1": "MAX",
		"2": "MIS"
	},
	"Cutlass": {
		"0": "Black",
		"1": "Red",
		"2": "Blue"
	},
	"Avenger": {
		"0": "Stalker",
		"1": "Titan",
		"2": "Warlock",
		"3": "Titan"
	},
	"Gladiator": {},
	"M50": {},
	"Starfarer": {
		"0": "Gemini"
	},
	"Caterpillar": {
		"0": "Pirate"
	},
	"Retaliator": {
		"0": "Bomber",
		"1": "Base"
	},
	"Scythe": {},
	"Idris-M": {},
	"Idris-P": {},
	"P-52": {
		"0": "Merlin"
	},
	"Mustang": {
		"0": "Alpha",
		"1": "Beta",
		"2": "Gamma",
		"3": "Delta",
		"4": "Omega",
		"5": "Alpha"
	},
	"Redeemer": {},
	"Gladius": {
		"0": "Valiant"
	},
	"Khartu-Al": {},
	"Merchantman": {},
	"Carrack": {},
	"Herald": {},
	"Hull": {
		"0": "C",
		"1": "A",
		"2": "B",
		"3": "D",
		"4": "E"
	},
	"Orion": {},
	"Reclaimer": {},
	"Javelin": {},
	"Vanguard": {
		"0": "Warden",
		"1": "Harbinger",
		"2": "Sentinel",
		"3": "Hoplite"
	},
	"Reliant": {
		"0": "Kore",
		"1": "Mako",
		"2": "Sen",
		"3": "Tana"
	},
	"Genesis": {
		"0": "Starliner"
	},
	"Glaive": {},
	"Endeavor": {},
	"Sabre": {
		"0": "Comet",
		"1": "Raven"
	},
	"Crucible": {},
	"P72": {
		"0": "Archimedes"
	},
	"Blade": {},
	"Prospector": {},
	"Buccaneer": {},
	"Dragonfly": {
		"0": "Yellowjacket",
		"1": "Black"
	},
	"MPUV": {
		"0": "Personnel",
		"1": "Cargo"
	},
	"Terrapin": {},
	"Polaris": {},
	"Prowler": {},
	"85X": {},
	"Razor": {
		"0": "EX",
		"1": "LX"
	},
	"Hurricane": {},
	"Banu": {
		"0": "Defender"
	},
	"Eclipse": {},
	"Nox": {
		"0": "Kue"
	},
	"Cyclone": {
		"0": "TR",
		"1": "RC",
		"2": "RN",
		"3": "AA"
	},
	"Ursa": {
		"0": "Rover",
		"1": "Rover"
	},
	"600i": {
		"0": "Touring",
		"1": "Explorer"
	},
	"X1": {
		"0": "Base",
		"1": "Velocity",
		"2": "Force"
	},
	"Pioneer": {},
	"Hawk": {},
	"Hammerhead": {},
	"Geotack": {
		"0": "Planetary"
	},
	"Geotack-X": {
		"0": "Planetary"
	},
	"Nova": {},
	"Vulcan": {},
	"100i": {},
	"125a": {},
	"135c": {},
	"Hercules": {
		"0": "C2",
		"1": "M2",
		"2": "A2"
	},
	"Vulture": {},
	"Apollo": {
		"0": "Triage",
		"1": "Medivac"
	},
	"Mercury": {
		"0": "Star"
	},
	"Valkyrie": {
		"0": "Liberator"
	},
	"Kraken": {},
	"Arrow": {},
	"Santok.yāi": {},
	"SRV": {},
	"Corsair": {},
	"Ranger": {
		"0": "RC",
		"1": "TR",
		"2": "CV"
	},
	"Anvil": {
		"0": "Ballista",
		"1": "Ballista",
		"2": "Ballista"
	},
	"Nautilus": {
		"0": "Solstice"
	},
	"Pirate": {
		"0": "Gladius"
	},
	"Mantis": {}
}


/*
OPTIONS
- Create a list of primary ship names (Constellation, Aurora, Sabre) and their secondary names. Each time a user asks for that ship, we roll to the next one in the array. Requires tracking which one was last asked for, but we might be able to do that on a persistent scale. 
- Create a list of primary ship names, then ask the user which of the sub-types they want. Represent them either by reaction (1,2,3) or use the Collector functionality to ask "Which variant?", print the options, and wait for the next input by the same user
*/