module.exports = {
    name:"test",
    cmd:"test",
    description:"Use for running tests",
    execute( message, args, settings)
    {
       console.log(makeBaseSettings());
    }  
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