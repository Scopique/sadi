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
                 
          }
        });
      }

      
    });
    
    //Add independent execution here
    AddGuildRoles(guild.id, guild.roles);
    
  }
};


async function GetGuildByID(gid) { 
  const _args = {id:gid};
  const _db = DBQuery();
  try{  
    return(
      _db.query('SELECT id, name from sadi_guild where ?',[_args])
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

async function AddGuild(guild) {
  const _timestamp = {toSqlString:function() { return 'CURRENT_TIMESTAMP()';}}
  const _args = {id:guild.id, name:guild.name, ownerID:guild.ownerID, lastDBUpdate:_timestamp};
  const _db = DBQuery();

  try{
    return(
      _db.query('INSERT INTO sadi_guild set ?', _args)
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

async function AddGuildRoles(gid, roles) { 
  const _timestamp = {toSqlString:function() { return 'CURRENT_TIMESTAMP()';}}
  const _roleCnt = roles.length;
  const _db = DBQuery();
  var _args = { };
  var _queries = [];
  var _existingRoles = [];

  //Check the existing roles for this guild. Collect those we have
  //  so we can omit them from the insert. Better than deleting them.
  //NOTE: Wonder if we update those who exist, in case the name changed.
  roles.forEach(role=>{
    _args = {id:role.id};
    var _query = _db.query("SELECT id FROM sadi_guild_roles WHERE ?", [_args]);
    _queries.push(_query);
  });

  Promise.all(_queries)
  .then(results=>{
    for(var i = 0; i < results.length; i++){
      _existingRoles.push(results[i][0].id);
    }
    
  });


  // roles.forEach(role=>{
  //   _args = {id: role.id, guildID: gid, name: role.name.replace("@",""), lastDBUpdate: _timestamp};
  //   //id|guildID|name|lastDBUpdate
  //   var _query = _db.query("INSERT INTO sadi_guild_roles SET ?", [_args]);
  //   _queries.push(_query);
  // });

  // return(
  //   Promise.all(_queries)
  //   .then(results=>{
  //     var _ok = true;
  //     var _rdo = ReturnDataObject(
  //       "OK",`${results.length} Roles added to the database`,`${results.length} Roles added to the database`,{}
  //     );
  //     results.forEach(result=>{
  //       if (result.affectedRows == 0)
  //       {
  //         _rdo.status = "ERR";
  //         _rdo.message="A technical issue occured.";
  //         _rdo.technicalMessage="At least one Role insertion failed. Suggest truncate and investigate.";
  //       }
  //     });
  //     return _rdo;
  //   })
  // )
  // .catch(err=>{
  //   console.log(err);
  // })
}

function AddGuildUsers(gid, users) {
  console.log(`Add users to database.`);
  var _timestamp = {toSqlString:function() { return 'CURRENT_TIMESTAMP()';}}
  var _userCnt = Object.keys(users).length;
  var _args = { };
  for(var i = 0; i < _userCnt; i++){
    //Do we check for this user in the database?
    _args = {
      id: users[i].id, 
      guildID: gid, 
      username: user[i].username, 
      discriminator: users[i].discriminator, 
      nickname: users[i].nickname, 
      avatarURL: users[i].avatarURL,
      displayAvatarURL: users[i].displayAvatarURL,
      lastDBUpdate: _timestamp};
    console.log(_args);
    // _conn.query("INSERT INTO sadi_guild_users SET ?", [_args], function(error, results, fields){
    //   if (error) throw error;
    //   //Dunno
    // });
  }

 }

function GetGuildRole(gid, rid) { } 

function GetGuildUser(gid, uid) { }

function DBQuery(){
  return {
    query(sql, args){
      return util.promisify(_conn.query).call(_conn, sql, args);
    }
  }
}

function ReturnDataObject(status, msg, tmsg, data){
  return {
    status:status,
    message: msg,
    technicalMessage:tmsg,
    data: data
  };
}

(function(){
  _conn = mysql.createPool({
      connectionLimit: 10,
      host     : process.env.DB_URL,
      user     : process.env.DB_USR,
      password : process.env.DB_PWD,
      database : process.env.DB_CAT
    });
  
})();