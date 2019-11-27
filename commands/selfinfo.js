module.exports = {
    name:"selfinfo",
    cmd:"selfinfo",
    description:"Get my Discord info",
    execute( message, args, settings)
    {
       console.log(myInfo(message));
    }  
}

function myInfo(message)
{
    const _me = message.author;

    let _myinfo = {};
    _myinfo.id = _me.id;
    _myinfo.username = _me.username;

    return _myinfo;
}