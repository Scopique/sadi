/***************************************************************
 *                       GAME DATA
 * Pulls data from the SCAPI and stores it in our central
 * database. We do this so we do not have to constantly pull
 * massive amounts of data from the API all the time. 
 **************************************************************/
 const scapi = require("./scapi.js");
 const util = require("util");
 const mysql = require("mysql");

 module.exports ={
   RefreshData:function(){
     SetSystems();
     
   }
 }


 async function SetSystems() {
  const _timestamp = {toSqlString:function() { return 'CURRENT_TIMESTAMP()';}}
  const _db = DBQuery();
  var _collection = [];

  //TODO: We can't rely on the error to catch dupes when using Promise.all
  //Promise.all will bail as soon as it encounters an error, so as soon as it 
  //  runs into a dupe, it'll exit, even if there are NEW systems to add. 

  try{
    return(
      scapi.GetSystemsRefresh()
      .then(result=>{
        result.data.forEach(sys=>{
          try{
            GetSystems(sys.name).then(itm=>{
              if (itm.length == 0){
                var _args = [
                  itm.code,
                  itm.affiliation[0].id, 
                  `[${itm.position_x},${itm.position_y},${itm.position_z}]`,
                  itm.status,
                  itm.thumbnail == undefined ? "" : itm.thumbnail.source,
                  itm.thumbnail == undefined ? "" : itm.thumbnail.slug,
                  itm.type == undefined ? "" : itm.type,
                  itm.description,
                  itm.name,
                  _timestamp];
                var _query = _db.query(`INSERT INTO sadi_sc_systems SET code=?, affiliation=?, position=?, status=?,
                img=?, slug=?, type=?, description=?, name=?, lastDBUpdate=?`,_args);
                _collection.push(_query);
              }else{
                console.log(`${sys.name} exists in db and will not be added.`);
              }
            })
          }catch(err){
            console.log(`SetSystems error =>${err}`);
          }
        })

        return _collection;
      })
      .then(queries=>{
        Promise.all(queries)
        .then(result=>{console.log(result)})
        .catch(err=>{console.log(err)})
      })
      .catch(err=>console.log(err))
    )
  }catch(err)
  {
    console.log(`GetSystems refresh error => ${err}`);
  }
 };

async function SetTunnels() {
  const _timestamp = {toSqlString:function() { return 'CURRENT_TIMESTAMP()';}}
  const _db = DBQuery();
  var _collection = [];

  try{
    return(
      scapi.GetTunnelsRefresh()
      .then(result=>{
        result.data.forEach(itm=>{
          /*
          item.data.?

          direction: "B", which might be "Both" or eventually "One"?
          entry.code:[SYSTEM].JUMPPOINTS.[SYSTEM]
          entry.designation:"[SYSTEM] - [SYSTEM]" //The "name"
          entry.id: INT
          entry.name: null
          entry.star_system_id: ?
          entry.status:"P"
          entry.type:"JUMPPOINT"
          entry_id: INT
          exit_id: INT
          id: INT
          name: null
          size: "S","M","L","?"

          In addition to "entry" we have a matching "exit" in the same loop. It's basically the inverse, although it carries with it all of its 
          own ID values. We might need to break down the Entry and Exit records into a normalized object with pointers to the other side.
          */
        })
      })
      .catch(err=>console.log(err))
    )
  }catch(err)
  {
    console.log(`GetTunnels refresh error => ${err}`);
  }
 };

 async function SetSpecies() {
  const _timestamp = {toSqlString:function() { return 'CURRENT_TIMESTAMP()';}}
  const _db = DBQuery();
  var _collection = [];

  try{
    return(
      scapi.GetSpeciesRefresh()
      .then(result=>{
        result.data.forEach(itm=>{
          /*
          item.data.?

          code: FK "HUMAN","BANU","XIAN", etc
          id: FK
          name: Friendly name
          */
        })
      })
      .catch(err=>console.log(err))
    )
  }catch(err)
  {
    console.log(`GetSpecies refresh error => ${err}`);
  }
 };

async function SetAffiliations() {
  const _timestamp = {toSqlString:function() { return 'CURRENT_TIMESTAMP()';}}
  const _db = DBQuery();
  var _collection = [];

  try{
    return(
      scapi.GetAffiliationsRefresh()
      .then(result=>{
        result.data.forEach(itm=>{
          /*
          item.data.?

          code: FK "uee","BANU","VNCL", etc
          color: Hex value...?
          id: FK INT
          name: Display name
          */
        })
      })
      .catch(err=>console.log(err))
    )
  }catch(err)
  {
    console.log(`GetAffiliations refresh error => ${err}`);
  }
 };

async function SetObjects() {
  const _timestamp = {toSqlString:function() { return 'CURRENT_TIMESTAMP()';}}
  const _db = DBQuery();
  var _collection = [];

  try{
    return(
      scapi.GetObjectsRefresh()
      .then(result=>{
        result.data.forEach(itm=>{
          /*
          item.data.?

          code: [SYSTEM].[TYPE].[NAME]
          description: long text
          designation: Official name (Stanton II)
          id: int
          name: Coloquial name (Crusader)
          parent_id: INT, but no indication of what this ID represents
          subtype.name: "Gas Giant", "Terrestrial Rocky", null
          subtype.type: "PLANET", "SATELLITE", etc
          texture.images/.post/.product_thumb_large/.subscribers_vault_thumbnail
          slug: slug
          time_modified: Again, API or CIG?
          type: Possibly mirros subtype.type

          children
          -- Children break out into pretty much the same properties
            as above, although there doesn't seem to be a TEXTURE node. Here, the
            parent_id would relate directly to the parent object, so we can link
            this stuff up as needed.

          Note that the top-level TYPE doesn't always match the TYPE in the code.
          Cellin is STANTON.MOONS.CELLIN, but the type is SATELLITE. Stations and comm sats seem to be root TYPE MANMADE 

          !IMPORTANT! This output apparently contains jump points, which we can
          parse out by root TYPE != JUMPPOINT. These would duplicate the 
          gates we would have sourced from TUNNELS.
          
          affiliation.id/.code/.name
          
          */
        })
      })
      .catch(err=>console.log(err))
    )
  }catch(err)
  {
    console.log(`GetAffiliations refresh error => ${err}`);
  }
 };

 async function GetSystems(name=null) {
  const _db = DBQuery();
  
  try{
    var _query = "SELECT * FROM sadi_sc_systems";
    if (name !=null) { _query += " WHERE name=?" }
    return(
      _db.query(_query, [name])
      .then(result=>{
        var _results = [];
        result.forEach(itm=>{
          _results.push(
            {
              "code":itm.code,
              "name":itm.name,
              "description":itm.description,
              "type":itm.type,
              "affiliation":itm.affiliation,
              "position":itm.position,
              "status":itm.status,
              "img":itm.img,
              "slug":itm.slug,
              "lastDBUpdate":itm.lastDBUpdate
            }
          )
        })
        return _results;
      })
      .then(result=>{ return result })
      .catch(err=>console.log(`GetSystems error=> ${err}`))
    )
  }catch(err){
    console.log(`GetSystems error=> ${err}`)
  }
 };

async function GetTunnels() {
  const _timestamp = {toSqlString:function() { return 'CURRENT_TIMESTAMP()';}}
  const _db = DBQuery();
  var _collection = [];

  try{
    return(
      scapi.GetTunnelsRefresh()
      .then(result=>{
        result.data.forEach(itm=>{
          /*
          item.data.?

          direction: "B", which might be "Both" or eventually "One"?
          entry.code:[SYSTEM].JUMPPOINTS.[SYSTEM]
          entry.designation:"[SYSTEM] - [SYSTEM]" //The "name"
          entry.id: INT
          entry.name: null
          entry.star_system_id: ?
          entry.status:"P"
          entry.type:"JUMPPOINT"
          entry_id: INT
          exit_id: INT
          id: INT
          name: null
          size: "S","M","L","?"

          In addition to "entry" we have a matching "exit" in the same loop. It's basically the inverse, although it carries with it all of its 
          own ID values. We might need to break down the Entry and Exit records into a normalized object with pointers to the other side.
          */
        })
      })
      .catch(err=>console.log(err))
    )
  }catch(err)
  {
    console.log(`GetTunnels refresh error => ${err}`);
  }
 };

 async function GetSpecies() {
  const _timestamp = {toSqlString:function() { return 'CURRENT_TIMESTAMP()';}}
  const _db = DBQuery();
  var _collection = [];

  try{
    return(
      scapi.GetSpeciesRefresh()
      .then(result=>{
        result.data.forEach(itm=>{
          /*
          item.data.?

          code: FK "HUMAN","BANU","XIAN", etc
          id: FK
          name: Friendly name
          */
        })
      })
      .catch(err=>console.log(err))
    )
  }catch(err)
  {
    console.log(`GetSpecies refresh error => ${err}`);
  }
 };

async function GetAffiliations() {
  const _timestamp = {toSqlString:function() { return 'CURRENT_TIMESTAMP()';}}
  const _db = DBQuery();
  var _collection = [];

  try{
    return(
      scapi.GetAffiliationsRefresh()
      .then(result=>{
        result.data.forEach(itm=>{
          /*
          item.data.?

          code: FK "uee","BANU","VNCL", etc
          color: Hex value...?
          id: FK INT
          name: Display name
          */
        })
      })
      .catch(err=>console.log(err))
    )
  }catch(err)
  {
    console.log(`GetAffiliations refresh error => ${err}`);
  }
 };

async function GetObjects() {
  const _timestamp = {toSqlString:function() { return 'CURRENT_TIMESTAMP()';}}
  const _db = DBQuery();
  var _collection = [];

  try{
    return(
      scapi.GetObjectsRefresh()
      .then(result=>{
        result.data.forEach(itm=>{
          /*
          item.data.?

          code: [SYSTEM].[TYPE].[NAME]
          description: long text
          designation: Official name (Stanton II)
          id: int
          name: Coloquial name (Crusader)
          parent_id: INT, but no indication of what this ID represents
          subtype.name: "Gas Giant", "Terrestrial Rocky", null
          subtype.type: "PLANET", "SATELLITE", etc
          texture.images/.post/.product_thumb_large/.subscribers_vault_thumbnail
          slug: slug
          time_modified: Again, API or CIG?
          type: Possibly mirros subtype.type

          children
          -- Children break out into pretty much the same properties
            as above, although there doesn't seem to be a TEXTURE node. Here, the
            parent_id would relate directly to the parent object, so we can link
            this stuff up as needed.

          Note that the top-level TYPE doesn't always match the TYPE in the code.
          Cellin is STANTON.MOONS.CELLIN, but the type is SATELLITE. Stations and comm sats seem to be root TYPE MANMADE 

          !IMPORTANT! This output apparently contains jump points, which we can
          parse out by root TYPE != JUMPPOINT. These would duplicate the 
          gates we would have sourced from TUNNELS.
          
          affiliation.id/.code/.name
          
          */
        })
      })
      .catch(err=>console.log(err))
    )
  }catch(err)
  {
    console.log(`GetAffiliations refresh error => ${err}`);
  }
 };

 /***********************************************************************
 * DBQuery()
 * - Promisifies the mysql.js query
 * 
 * mysql.js operates async but doesn't handle the standard promise format,
 * nor does it accept a callback for when the process has completed. This
 * wrapper allows queryies to be handled as promises so we can use the 
 * .then().catch().finally() construct
 **********************************************************************/
function DBQuery(){
  return {
    query(sql, args){
      return util.promisify(_conn.query).call(_conn, sql, args);
    }
  }
}

/***********************************************************************
 * ReturnDataObject(status, msg, tmsg, data)
 * - A data transport object
 * 
 * ReturnDataObject (rdo) is a message container object that allows us
 * to craft return objects to callers that contains an operational STATUS
 * value (OK, NOTE, ERR), friendly and technical messages, and a 
 * data payload object. 
 **********************************************************************/
function ReturnDataObject(status, msg, tmsg, data){
  return {
    status:status,
    message: msg,
    technicalMessage:tmsg,
    data: data
  };
}

/***********************************************************************
 * Module init function
 * - Sets up the connection pool for the connection to the database.
 **********************************************************************/
(function(){
  _conn = mysql.createPool({
      connectionLimit: 10,
      host     : process.env.DB_URL,
      user     : process.env.DB_USR,
      password : process.env.DB_PWD,
      database : process.env.DB_CAT
    });
  
})();