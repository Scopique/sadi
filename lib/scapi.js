/***************************************************************
 *                STAR CITIZEN API ACCESS
 * https://starcitizen-api.com/startup.php
 * Used with sadi.js
 **************************************************************/
const fetch = require("node-fetch");
const utils = require("./sadi_utilities.js");
const fs = require('fs');
const moment = require("moment");
const {promisify} = require("util");

const tempFiles = {
  ships:"./scdata/temp/ships.json",
  systems:"./scdata/temp/systems.json",
  species:"./scdata/temp/species.json",
  affiliations:"./scdata/temp/affiliations.json",
  tunnels:"./scdata/temp/tunnels.json",
  objects:"./scdata/temp/objects.json"
}

const files = {
  control:"./scdata/control.json",
  ships:"./scdata/ships.json",
  systems:"./scdata/systems.json",
  species:"./scdata/species.json",
  affiliations:"./scdata/affiliations.json",
  tunnels:"./scdata/tunnels.json",
  objects:"./scdata/objects.json",
  search: "./scdata/search.json"
}

const freshnessPeriod = 0;

const apiEndpoints = {
  ships:process.env.SC_API_SHIPS_URI,
  systems:process.env.SC_API_SYSTEMS_URI,
  tunnels:process.env.SC_API_TUNNELS_URI,
  species:process.env.SC_API_SPECIES_URI,
  affiliations:process.env.SC_API_AFFILIATIONS_URI,
  objects:process.env.SC_API_OBJECTS_URI
}

/**********************************************************************
 * SCAPI - Star Citizen API Interface
 * 
 * This library will access the SCAPI at the highest levels (parameterless)
 * and save the results to files that we can access using a dedicated
 * JSON query mechanism. 
 * 
 * The only exception is the /starmap/search, which needs to query against
 * the LIVE data, and requires a ?name= parameter. We can do this when
 * building the master file, or we can do it as part of the initial system
 * file write
 *********************************************************************/
module.exports = {
  RefreshAPIData:async function(override = false){
    //Check the control file for the last update date, and if it's 
    //  outside the acceptable freshness date, run the update.
    var _refreshOK = override==true ? true: CheckFreshness();
    if (_refreshOK){
      UpdateData(apiEndpoints.ships, tempFiles.ships)
      .then(rdo=>{
        if (rdo.status == "OK"){
          console.log("Ships OK");
          UpdateData(apiEndpoints.systems, tempFiles.systems)
          .then(rdo=>{
            if(rdo.status == "OK"){
              console.log("Systems OK");
              UpdateData(apiEndpoints.tunnels, tempFiles.tunnels)
              .then(rdo=>{
                if(rdo.status == "OK"){
                  console.log("Tunnels OK");
                  UpdateData(apiEndpoints.species, tempFiles.species)
                  .then(rdo=>
                    {if(rdo.status == "OK"){
                      console.log("Species OK");
                      UpdateData(apiEndpoints.affiliations, tempFiles.affiliations)
                      .then(rdo=>{
                        if(rdo.status == "OK"){
                          console.log("Affiliations OK");
                          UpdateData(apiEndpoints.objects, tempFiles.objects)
                          .then(rdo=>{
                            if(rdo.status == "OK")
                            {
                              console.log("Objects OK");
                              //Update the freshness file
                              CleanShips();
                              CleanSystems()
                              UpdateFreshness();

                            }else{console.log(rdo.message)}
                          })
                        }else{console.log(rdo.message)}
                      })
                    }else{console.log(rdo.message)}
                  })
                }else{console.log(rdo.message)}
              })
            }else{console.log(rdo.message)}
          })
        }else{
          console.log(rdo.message);
        }
      });
    }
  },
  CleanFiles:function(){
    CleanShips();
    CleanObjects();
    CleanSystems();
  }
  
}

function CheckFreshness(){
  const _ctl = JSON.parse(fs.readFileSync(files.control));
  const _nextUpdateWindow = moment(_ctl).add(1,'days');

  if (moment(_nextUpdateWindow).isAfter(moment()))
  {
    console.log("Too soon to update API data")
    return true;
  }else{
    console.log("OK to update API data");
    return true;
  }
}

function UpdateFreshness()
{
  var _lastUpdate = {
    lastUpdate:moment()
  }
  fs.writeFileSync(files.control, JSON.stringify(_lastUpdate));
    console.log("Freshness OK");
}

async function UpdateData(api, file){
  try {
    return(
      fetch(api)
      .then(results=>{return results.json()})
      .then(results=>{
        fs.writeFileSync(file, JSON.stringify(results));
        return results;
      })
      .then(results=>{
        switch (api)
        {
          case "systemsAPI":
            _systemData = results;
            break;
          case "tunnelsAPI":
            _tunnelsData = results;
            break;
          case "speciesAPI":
            _speciesData = results;
            break;
          case "affiliationsAPI":
            _affiliationsData = results;
            break;
          case "objectsAPI":
            _objectsData = results;

          break;
        }

        return utils.ReturnDataObject(
          "OK",
          `${file} has been updated.`,
          `${file} has been updated.`,
          {}
        );
      })
      .catch(err=>{
        console.log(err);
      })
    )
  }catch(err){
    console.log(err);
    return utils.ReturnDataObject(
      "ERR",
      "Oops. A technical error has occured",
      `${err}`,
      {}
    );
  }
}

function CleanShips(){
  var _data = [];
  var _shipData = readFile(tempFiles.ships);
  _shipData.data.forEach(itm=>{    
    if (itm!=null){
      const _mfrName = itm.manufacturer == undefined ? "" : itm.manufacturer.name;
      const _mfrLogo = itm.manufacturer == undefined ? "" : itm.manufacturer.media[0].source_url;
      const _shipLogo = itm.media[0].images.banner == undefined ? "" : itm.media[0].images.banner;
      _data.push({
        "id":itm.id,
        "name":itm.name == null ? "" : itm.name,
        "cargocapacity":itm.cargocapacity == null ? "0" : itm.cargocapacity,
        "description":itm.description == null ? "[REDACTED]": itm.description,
        "focus":itm.focus == null ? "[REDACTED]" : utils.ToProperCase(itm.focus),
        "manufacturer":_mfrName,
        "logo":_mfrLogo,
        "crew":(itm.min_crew == null ? "0" : itm.min_crew) + "/" + (itm.max_crew == null ? "0" : itm.max_crew),
        "banner":_shipLogo,
        "price":itm.price == null ? "0": itm.price,
        "production_status":itm.production_status == null ? "[REDACTED]" : utils.ToProperCase(itm.production_status),
        "size":itm.size == null ? "[REDACTED]" : utils.ToProperCase(itm.size),
        "url":itm.url == null ? "http://robertsspaceindustries.com" : itm.url,
        "type":itm.type == null ? "[REDACTED]" : utils.ToProperCase(itm.type)
      })
    }
  });
  fs.writeFileSync(files.ships, JSON.stringify(_data));
  console.log("Ships cleaned");
}

function CleanSystems(){
  var _systemData = readFile(tempFiles.systems);
  var _tunnelData = readFile(tempFiles.tunnels);
  var _objectsData = readFile(tempFiles.objects);

  var _cleanSystems = ParseSystemData(_systemData.data);
  _cleanSystems.forEach(sys=>{
    sys["gates"] = ParseTunnelsData(_tunnelData.data, sys.id);
    sys["objects"] = ParseObjectsData(_objectsData.data, sys.code);
  })
  fs.writeFileSync(files.systems, JSON.stringify(_cleanSystems));
  console.log("Systems cleaned");
}

function CleanObjects(){
  var _data = [];
  var _objData = readFile(tempFiles.objects);
  _objData.data.forEach(itm=>{
    if (itm!=null){
      var _subtype = itm.subtype == undefined ? (itm.code.split(".")[1] == "LZS" ? "Landing Zone": "[REDACTED]") : itm.subtype.type;
      var _subname = itm.subtype == undefined ? (itm.code.split(".")[1] == "LZS" ? "Landing Zone": "[REDACTED]") : itm.subtype.name;
      _data.push({
        "id":itm.id,
        "name":itm.name == null ? (itm.designation == null ? "[REDACTED]" : itm.designation) : itm.name,
        "description":itm.description == null ? "[REDACTED]": itm.description,
        "designation":itm.designation == null ? "[REDACTED]" : itm.designation,
        "code":itm.code == null ? "[REDACTED]" : itm.code,
        "type":itm.type == null ? "[REDACTED]" : itm.type,
        "subtype":_subtype,
        "classification":_subname
      })
    }
  });
  fs.writeFileSync(files.objects, JSON.stringify(_data));
  console.log("Objects cleaned");
}

function ParseSystemData(data){
  var _data = [];
  data.forEach(itm=>{
    _data.push({
      "id":itm.id,
      "name":itm.name,
      "affiliation":itm.affiliation[0].name,
      "description":itm.description,
      "code":itm.code,
      "pos_x":itm.position_x,
      "pos_y":itm.position_y,
      "pos_z":itm.position_z,
      "status":itm.status,
      "img":itm.thumbnail != undefined ? itm.thumbnail.source : "",
      "slug":itm.thumbnail != undefined ? itm.thumbnail.slug : "",
      "type":itm.type
    });
  })
  return _data;
}

function ParseTunnelsData(data, sysID){
  var _data = [];
  data.forEach(itm=>{
    if (itm.entry.star_system_id == sysID){
      _data.push({
        "id":itm.entry.id,
        "designation": itm.entry.designation,
        "exitTo":itm.exit.star_system_id,
        "size":itm.size
      })
    }
  })
  return _data;
}

function ParseObjectsData(data, parentCode)
{
  var _data = [];
  var _ids = [];
  var _objs = new Set(RecurseObjects(data, parentCode));

  _objs.forEach(itm=>{
    if (_ids.indexOf(itm.id) === -1)
    {
      _ids.push(itm.id);
      var _subtype = itm.subtype == undefined ? (itm.code.split(".")[1] == "LZS" ? "Landing Zone": "[REDACTED]") : itm.subtype.type;
      var _subname = itm.subtype == undefined ? (itm.code.split(".")[1] == "LZS" ? "Landing Zone": "[REDACTED]") : itm.subtype.name;
      _data.push({
        "id":itm.id,
        "name":itm.name == null ? (itm.designation == null ? "[REDACTED]" : itm.designation) : itm.name,
        "description":itm.description == null ? "[REDACTED]": itm.description,
        "designation":itm.designation == null ? "[REDACTED]" : itm.designation,
        "code":itm.code == null ? "[REDACTED]" : itm.code,
        "type":itm.type == null ? "[REDACTED]" : itm.type,
        "subtype":_subtype,
        "classification":_subname
      })
    
    }    
  })
  return _data;
}

 function RecurseObjects(obj, parentCode) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(RecurseObjects(obj[i],parentCode));
        } 
        else 
        {
          if (i.toLowerCase() == "code" && obj[i].includes("."))
          {
            if(obj[i].split(".")[0].toLowerCase() == parentCode.toLowerCase()){
              objects.push(obj);
            }
          }
        }
    }
    return objects;
}









function readFile(file)
{
  var _data = JSON.parse(fs.readFileSync(file));
  return _data;
}
