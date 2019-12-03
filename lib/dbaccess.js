var mysql = require('mysql');
var _conn = null;

module.exports = {

  GuildRegister:function(guild){
    //TODO: This would be better as a stored procedure...
    var _guildChk = GetGuildByID(guild.id);
    alert(_guildChk)
  }
};


function GetGuildByID(gid) { 
  var _args = {id:gid};
  var _rdo  = {};
  _conn.query('SELECT id, name from sadi_guild where ?',[_args], function (error, results, fields) {
    if (error) throw error;
    _rdo = {id: results.id, name: results.name};
  });
}

function AddGuild(guild) {
  console.log(`New server registration - Guild ${guild.id}`);
  //We need to get info about this guild and save it. 
  var _timestamp = {toSqlString:function() { return 'CURRENT_TIMESTAMP()';}}
  var _args = {id:guild.id, name:guild.name, ownerID:guild.ownerID, lastDBUpdate:_timestamp};
  _conn.query('INSERT INTO sadi_guild set ?', [_args], function(error, results, fields){
    if (error) throw error;
    console.log(`Guild '${results[0].name}' is registered.`);
  });
 }

function AddGuildRoles(gid, roles) { 
  console.log(`Add guild roles to database.`);
  var _timestamp = {toSqlString:function() { return 'CURRENT_TIMESTAMP()';}}
  var _roleCnt = Object.keys(roles).length;
  var _args = { };
  for(var i = 0; i < _roleCnt; i++){
    //Do we check for this role in the database?
    _args = {id: roles[i].id, guildID: gid, name: roles[i].name, lastDBUpdate: _timestamp};
    console.log(_args);
    // _conn.query("INSERT INTO sadi_guild_roles SET ?", [_args], function(error, results, fields){
    //   if (error) throw error;
    //   //Dunno
    // });
  }
  
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

(function(){
  _conn = mysql.createPool({
      connectionLimit: 10,
      host     : process.env.DB_URL,
      user     : process.env.DB_USR,
      password : process.env.DB_PWD,
      database : process.env.DB_CAT
    });
  
})();