module.exports = {
    name:"selfinfo",
    cmd:"selfinfo",
    description:"Get my Discord info",
    execute( message, args, settings)
    {
       myInfo(message);
    }  
}

function myInfo(message)
{
  //64449347068100608
    //console.log(message.author);

    //message.guild.members.forEach(member=>console.log(member.user));
    //message.client.channels.forEach(itm=>console.log(itm.name + " - " + itm.type));
    //message.guild.roles.forEach(r=>console.log(r));

    //console.log(message.guild.ownerID);
    //message.guild.members.get('64449347068100608')._roles.forEach(r=>console.log(r));
    //console.log(message.guild.members.get('64449347068100608').user.displayAvatarURL);

    var _mbr = message.guild.members.get('64 449 347 068 100 608');
    console.log(_mbr.roles.has('64452680327626752'))

}