/***************************************************************
 *                STAR CITIZEN API ACCESS
 * https://starcitizen-api.com/startup.php
 * Used with sadi.js
 **************************************************************/
const fetch = require("node-fetch");
const utils = require("./sadi_utilities.js");
const fs = require('fs');
const moment = require("moment");

const files = {
  control:"./scdata/control.json",
  ships:"./scdata/ships.json",
  systems:"./scdata/systems.json",
  species:"./scdata/species.json",
  affiliations:"./scdata/affiliations.json",
  tunnels:"./scdata/tunnels.json",
  objects:"./scdata/objects.json",
  search: "./scdata/search.json",
  systemsMaster: "./scdata/systemsMaster.json"
}

const freshnessPeriod = 0;

const shipsAPI = process.env.SC_API_SHIPS_URI;  //Contains the API key to lookup via cache
const systemsAPI = process.env.SC_API_SYSTEMS_URI;
const tunnelsAPI = process.env.SC_API_TUNNELS_URI;
const speciesAPI = process.env.SC_API_SPECIES_URI;
const affiliationsAPI = process.env.SC_API_AFFILIATIONS_URI;
const objectsAPI = process.env.SC_API_OBJECTS_URI;
const searchAPI = process.env.SC_API_SEARCHES_URI;

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
  RefreshAPIData:function(){
    //Check the control file for the last update date, and if it's 
    //  outside the acceptable freshness date, run the update.
    var _refreshOK = CheckFreshness();
    if (_refreshOK){
      UpdateData(shipsAPI, files.ships)
      .then(rdo=>{
        if (rdo.status == "OK"){
          UpdateData(systemsAPI, files.systems)
          .then(rdo=>{
            if(rdo.status == "OK"){
              UpdateData(tunnelsAPI, files.tunnels)
              .then(rdo=>{
                if(rdo.status == "OK"){
                  UpdateData(speciesAPI, files.species)
                  .then(rdo=>
                    {if(rdo.status == "OK"){
                      UpdateData(affiliationsAPI, files.affiliations)
                      .then(rdo=>{
                        if(rdo.status == "OK")
                        {
                          UpdateData(objectsAPI, files.objects)
                          .then(rdo=>{
                            if(rdo.status == "OK")
                            {
                              var _fresh = UpdateFreshness();
                              if (_fresh.status == "OK"){
                                console.log("All API endpoints saved.");
                              }
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
      
      //readFile();
    }
  },
  RefreshMasterData:function(){
    GenSystemsMaster();
  }
}

function CheckFreshness(){
  var _ctl = JSON.parse(fs.readFileSync(files.control));
  //Do some date math here. Maybe need Moment.js
  return true;
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

function UpdateFreshness()
{
  try{
    const _lastUpdate={ "lastUpdate":moment.format() }
    console.log(_lastUpdate);
    fs.writeFileSync(files.control, JSON.stringify(_lastUpdate));
    return utils.ReturnDataObject(
      "OK",
      "Freshness date updated.",
      "Freshness date updated.",
      _lastUpdate
    );
  }catch(err)
  {
    return utils.ReturnDataObject(
      "ERR",
      "Oops. A technical error has occured",
      `${err}`,
      {}
    );
  } 
}

function GenSystemsMaster(){
  //Load systems, tunnels, species, affiliation, and objects
  //Starting with systems, pull info from species and affiliations
  //Then, get tunnels and objects for this system
  
  var _systemData = readFile(files.systems);
  var _tunnelData = readFile(files.tunnels);
  // var _speciesData = readFile(files.species);
  // var _affiliationsData = readFile(files.affiliations);
  var _objectsData = readFile(files.objects);

  var _masterData = ParseSystemData(_systemData.data);
  _masterData.forEach(sys=>{
    sys["gates"] = ParseTunnelsData(_tunnelData.data, sys.id);
    sys["objects"] = ParseObjectsData(_objectsData.data, sys.id);
  })

  


  console.log(`${_systemData.data.length} systems found.`);




  console.log(_masterData[0]);
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

//We will need a query system for this because this is going to suck to loop each time
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

function ParseObjectsData(data, sysID){
  var _data = [];
  data.forEach(itm=>{
    if (itm.parent_id == sysID){
      _data.push({
        "id":itm.id,
        "name":itm.name,
        "description":itm.description,
        "designation":itm.designation,
        "code":itm.code,
        "type":itm.type,
        "subtype":itm.subtype.type,
        "classification":itm.subtype.name
      })
    }
  })

  return _data;
}

function readFile(file)
{
  var _data = JSON.parse(fs.readFileSync(file));
  return _data;
}
