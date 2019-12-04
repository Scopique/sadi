const util = require("util");
const mysql = require('mysql');

var _conn = null;

module.exports = {

  GuildRegister:function(guild){

    console.log("register guild");

    GetGuildByID(guild.id).then(rslt=>
    {
      if (rslt.status == "NOTE"){
        AddGuild(guild).then(rslt=>{
          if (rslt.status == "OK")
          {
            AddGuildRoles(guild.id, guild.roles)
            .then(rslt=>{
              if (rslt.status == "OK"){
                AddGuildUsers(guild.id, guild.members)
                .then(rslt=>{
                  if (rslt.status == "OK")
                  {
                  AddRolesToUsers(guild.id, guild.members)
                  .then(rslt=>{
                    if (rslt.status == "OK")
                    {
                      console.log(`Guild ${guild.name} has been registered successfully.`);
                    }
                  });
                  }
                });
              }
            });        
          }
        });
      }      
    });
    
    //Add independent execution here
    
  }
};

/**************************************************************************
 * Execution functions
 *  These are the functions that perform individual operations like
 *  add, get, update, and delete.
 *  
 *  The pattern is to return a query promise, whose THEN() returns a
 *  data construct called ReturnDataObject. This message object contains
 *  a STATUS value (OK, NOTE, ERR), a friendly message, a technical message,
 *  and a payload object. 
 *  OK - Operation performed the expected job.
 *  NOTE - Operation did not perform as expected, but did not error. 
 *  ERR - A technical error occured that prevented the operation.
 *  Often times the NOTE status is returned when the op was carried out,
 *  but expected data was not found. This allows us to take additional 
 *  steps like adding new data when we determine that it does not
 *  already exist.
 *************************************************************************/

/***********************************************************************
 * GetGuildByID(gid)
 * - Get a guild from the database by it's Discord ID
 * This will return a ReturnDataObject with OK, NOTE, or ERR. Hard
 * errors are reported to the console.
 **********************************************************************/
async function GetGuildByID(gid) { 
  const _db = DBQuery();
  try{  
    return(
      _db.query(mysql.format('SELECT id, name from sadi_guild where id=?', [gid]))
      .then(result=>{
        if(result.length > 0){
          return ReturnDataObject(
            "OK",`Guild ${gid} found!`, `Guild ${gid} found!`, {
              id: result[0].id,
              name: result[0].name
            }
          )
        }else{
          return ReturnDataObject(
            "NOTE",`Guild ${gid} not found!`, `Guild ${gid} not found!`, {}
          )
        }
      })
      .catch(err=>{
        console.log(err);
        return (
          ReturnDataObject(
            "ERR",`A technical error has occured.`, `${err}`, {}
          )
        );
      })
    );
  }catch(err){
    console.log(err);
  }
}

/***********************************************************************
 * AddGuild(guild)
 * - Adds a guild's info to the database
 * This will return a ReturnDataObject with OK, NOTE, or ERR. Hard
 * errors are reported to the console.
 * 
 * Unlike some of the following functions, this does not check for the
 * existence of the guild; we use the GetGuildByID() function for that,
 * and call this method if the result status == NOTE (i.e. the guild-by-id
 * was not found in the database).
 **********************************************************************/
async function AddGuild(guild) {
  const _timestamp = {toSqlString:function() { return 'CURRENT_TIMESTAMP()';}}
  const _db = DBQuery();

  try{
    return(
      _db.query(mysql.format('INSERT INTO sadi_guild set id=?, name = ?, ownerID = ?, lastDBUpdate= ?', [guild.id, guild.name, guild.ownerID, _timestamp]))
      .then(result=>{
        if (result.affectedRows > 0){
          return ReturnDataObject(
            "OK",`Guild '${_args.name}' has been recorded.`,`Guild '${_args.name}' has been recorded.`, {
              affectedRows:result.affectedRows,
              message:result.message
            }
          );
        }else{
          return ReturnDataObject(
            "ERR",`Guild '${_args.name}' has not been recorded.`,`Could not insert new guild - ${result.message}.`, result
          );
        }
      })
      .catch(err=>{
        return ReturnDataObject(
            "ERR",`Guild '${_args.name}' has not been recorded.`,`Could not insert new guild - ${err}.`, {}
          );
      })
    )
  }catch(err){
    console.log(err);
  }
 }

/***********************************************************************
 * AddGuildRoles(gid, roles)
 * - Adds a guild's roles to the database
 * This will return a ReturnDataObject with OK or ERR. Hard
 * errors are reported to the console.
 * 
 * This operation uses Promise.all(iterator) to insert records in parallel
 * in order to speed up the operation. We add the query promises to an 
 * array, and then execute them all using Promise.all(array). The result
 * returned from this function will be OK with a message indicating how many
 * records were inserted (new) and how many were skipped (exist). Hard
 * errors are logged to the console. 
 **********************************************************************/
async function AddGuildRoles(gid, roles) { 
  const _timestamp = {toSqlString:function() { return 'CURRENT_TIMESTAMP()';}}
  const _db = DBQuery();

  var _queries = [];
  
  roles.forEach(role=>{
    //id|guildID|name|lastDBUpdate
    _queries.push(
      _db.query(mysql.format("INSERT INTO sadi_guild_roles SET id=?, guildID=?, name=?, lastDBUpdate=?", [role.id, gid, role.name.replace("@",""), _timestamp]))
      .catch(err=>{
        if (err.code == 'ER_DUP_ENTRY'){
          //console.log(`Role ${role.name} exists for this guild. Record was not inserted.`);
        }else{
          //console.log(`Pre ALL error - ${err}`);
        }
      })
    );
  });

  return(
    Promise.all(_queries)
    .then(results=>{
      var _intCnt = 0;
      results.forEach(rslt=>{ if (rslt != undefined){ _intCnt++ } });
      var _rdo = ReturnDataObject(
        "OK",`${_intCnt} Roles added to the database; ${results.length - _intCnt} not added, possibly duplicates.`,`${_intCnt} Roles added to the database; ${results.length - _intCnt} not added, possibly duplicates.`,{}
      )
      return _rdo;
    })
  )
  .catch(err=>{
    console.log(err);
  })
}

/***********************************************************************
 * AddGuildUsers(gid, members)
 * - Adds a guild's members to the database
 * This will return a ReturnDataObject with OK or ERR. Hard
 * errors are reported to the console.
 * 
 * This operation uses Promise.all(iterator) to insert records in parallel
 * in order to speed up the operation. We add the query promises to an 
 * array, and then execute them all using Promise.all(array). The result
 * returned from this function will be OK with a message indicating how many
 * records were inserted (new) and how many were skipped (exist). Hard
 * errors are logged to the console. 
 **********************************************************************/
async function AddGuildUsers(gid, members) {
  const _timestamp = {toSqlString:function() { return 'CURRENT_TIMESTAMP()';}}
  const _db = DBQuery();
  
  var _queries = [];
  
  members.forEach(member=>{
    //id|guildID|username|discriminator|nickname|avatarURL|displayAvatarURL|lastDBUpdate
    var _sql = mysql.format("INSERT INTO sadi_guild_users SET id=?, guildID=?, username=?, discriminator=?, nickname=?, avatarURL=?, displayAvatarURL=?, lastDBUpdate=?", [member.user.id, gid, member.user.username, member.user.discriminator, member.user.nickname, member.user.avatarURL, member.user.displayAvatarURL, _timestamp]);
    _queries.push(
      _db.query(_sql)   //Setup is too long to put it inline here : /
      .catch(err=>{
        if (err.code == 'ER_DUP_ENTRY'){
          console.log(`User ${member.user.username} exists for this guild. Record was not inserted.`);
        }else{
          console.log(`Pre ALL error - ${err}`);
        }
      })
    );
  });

  return(
    Promise.all(_queries)
    .then(results=>{
      var _intCnt = 0;
      results.forEach(rslt=>{ if (rslt != undefined){ _intCnt++ } });
      var _rdo = ReturnDataObject(
        "OK",`${_intCnt} Users added to the database; ${results.length - _intCnt} not added, possibly duplicates.`,`${_intCnt} Users added to the database; ${results.length - _intCnt} not added, possibly duplicates.`,{}
      )
      return _rdo;
    })
    .catch(err=>{console.log(`Error in ALL - ${err}`)})
  )
}

/***********************************************************************
 * GetGuildRole(gid, rid)
 * - Get a specific role from the database
 * 
 * Not really used, but is available for role lookup by ID 
 **********************************************************************/
async function GetGuildRole(gid, rid) {
  const _db = DBQuery();
  
  try{  
    return(
      _db.query(mysql.format('SELECT * FROM sadi_guild_roles WHERE id =? and guildID = ?', [rid, gid]))
      .then(result=>{
        if (result.length > 0){
          return ReturnDataObject(
            "OK", `Guild role ${result[0].name} found`, `Guild role ${result[0].name} found`, {
              id: result[0].id,
              guildID: result[0].guildID,
              name: result[0].name,
              lastDBUpdate: result[0].lastDBUpdate
            }
          );
        }else{
          return ReturnDataObject(
            "NOTE", `Guild role not found`, `Guild role ${rid} for guild ID ${gid} not found`, { }
          );
        }
      })
      .catch(err=>{
        return ReturnDataObject("ERR", `A technical error has occured`, `${err}`, { });
      })
    )
  }catch(err){
    return ReturnDataObject("ERR", `A technical error has occured`, `${err}`, { });
  }
} 

/***********************************************************************
 * GetGuildUser(gid, uid)
 * - Get a specific user from the database
 * 
 * Not really used, but is available for user lookup by ID 
 **********************************************************************/
async function GetGuildUser(gid, uid) {
  const _db = DBQuery();
  
  try{  
    return(
      _db.query(mysql.format('SELECT * FROM sadi_guild_users WHERE id =? and guildID = ?', [uid, gid]))
      .then(result=>{
        if (result.length > 0){
          return ReturnDataObject(
            "OK", `Guild user ${result[0].username} found`, `Guild user ${result[0].username} found`, {
              id: result[0].id,
              guildID: result[0].guildID,
              username: result[0].username,
              discriminator: result[0].discriminator,
              nickname: result[0].nickname,
              avatarURL: result[0].avatarURL,
              displayAvatarURL: result[0].displayAvatarURL,
              lastDBUpdate: result[0].lastDBUpdate
            }
          );
        }else{
          return ReturnDataObject(
            "NOTE", `Guild user not found`, `Guild user ${uid} for guild ID ${gid} not found`, { }
          );
        }
      })
      .catch(err=>{
        return ReturnDataObject("ERR", `A technical error has occured`, `${err}`, { });
      })
    )
  }catch(err){
    return ReturnDataObject("ERR", `A technical error has occured`, `${err}`, { });
  }

}

/***********************************************************************
 * AddRolesToUsers(gid, members)
 * - Associates users to roles within the guild
 * 
 * This pulls the roles collection from the guild.members object and
 * saves it. With this last step, we can associate a user with a role
 * within the guild using only the datbase.
 **********************************************************************/
async function AddRolesToUsers(gid, members) {
  const _timestamp = {toSqlString:function() { return 'CURRENT_TIMESTAMP()';}}
  const _db = DBQuery();
  
  var _queries = [];

  try{
    members.forEach(member => {
      var _userID = member.user.id;
      member._roles.forEach(role=>{
        _queries.push(
          _db.query(mysql.format('INSERT INTO sadi_guild_user_roles SET guildID=?, userID=?, roleID=?, lastDBUpdate=?', [gid, _userID, role, _timestamp]))
          .catch(err=>{
            if (err.code == 'ER_DUP_ENTRY'){
              console.log(`Role-to-user ${role} => ${_userID} exists for this guild. Record was not inserted.`);
            }else{
              console.log(`Pre ALL error - ${err}`);
            }
          })
        )
      })
    })

    return(
      Promise.all(_queries)
      .then(results=>{
        var _intCnt = 0;
        results.forEach(rslt=>{ if (rslt != undefined){ _intCnt++ } });
        var _rdo = ReturnDataObject(
          "OK",`${_intCnt} Roles-to-users added to the database; ${results.length - _intCnt} not added, possibly duplicates.`,`${_intCnt} Roles-to-users added to the database; ${results.length - _intCnt} not added, possibly duplicates.`,{}
        )
        return _rdo;
      })
      .catch(err=>{ console.log(`ALL err - ${err}`);
      })
    )
  }catch(err){
    console.log(err);
  }
}

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