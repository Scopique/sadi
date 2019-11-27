/***************************************************************
 *                       FILEACCESS
 * Loading files from disk. The main use is for loading and
 * saving the SETTINGS.json file. It loads when the bot starts
 * and saves every X seconds (in milliseconds) after that. 
 * It is also used to populate the main.commands Collection
 * with the modules from the COMMANDS directory.
 **************************************************************/
const fs = require("fs");
const fileloc = "./config/settings.json";
let timeout = null;

module.exports = {
    "Settings":{},
    LoadSettings: function() {
        //Loads settings from disk
        try
        {
            //fs.statSync(fileloc);
            this.Settings = JSON.parse(fs.readFileSync(fileloc));
            this.InitSaveTimer();
        }catch(e){
            if (e.code === 'ENOENT')
            {
                this.Settings = makeBaseSettings();
                this.SaveSettings();
            }else{
                console.log(e);
            }
            
        }
    },
    SaveSettings: function() {
        //Saves settings to disk
        fs.writeFileSync(fileloc, JSON.stringify(this.Settings));
        //console.log(`Saving settings - ${getDateTime()}`);
        this.InitSaveTimer();
    },
    InitSaveTimer: function(){
        //Set timer for settings save
        if(this.Settings !== null){
            setTimeout(() =>{
                this.SaveSettings();
            }, this.Settings.saveSettingsInterval === null ? 1 : this.Settings.saveSettingsInterval)
        }
    },
    LoadCommands: function(cmdCollection){
        //Load commands from the COMMANDS directory into the COMMANDS object.
        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
        for (const file of commandFiles) { 
            const command = require(`../commands/${file}`);
            cmdCollection.set(command.cmd, command);
        }
        return cmdCollection;
    },
}

//If no settings.json file exists, use this as a base.
//NOTE: Update this as new settings are added.
function makeBaseSettings()
{
    let newSettings = {};
    newSettings.saveSettingsInterval = 5000;
    newSettings.guildID = "";
    newSettings.lobby = {};
    newSettings.lobby.channelID = "";
    newSettings.lobby.channelName = "";
    newSettings.lobby.acceptRoleID = "";
    newSettings.lobby.acceptRole = "";
    newSettings.lobby.messageID = "";
    newSettings.outputChannel = {};
    newSettings.outputChannel.id = "";
    newSettings.outputChannel.level = "none";

    newSettings.auditEvents = {};
    newSettings.auditEvents.MESSAGE_DELETE = "messageDelete";
    newSettings.auditEvents.MESSAGE_UPDATE = "messageUpdate";

    newSettings.auditEvents.GUILD_MEMBER_ADD = "guildMemberAdd";
    newSettings.auditEvents.GUILD_MEMBER_REMOVE = "guildMemberRemove";
    newSettings.auditEvents.GUILD_MEMBER_UPDATE = "guildMemberUpdate";

    newSettings.auditEvents.GUILD_BAN_ADD = "guildBanAdd";
    newSettings.auditEvents.GUILD_BAN_REMOVE = "guildBanRemove";


    newSettings.auditEvents.CHANNEL_UPDATE = "channelUpdate";

    newSettings.auditEvents.PRESENCE_UPDATE = "presenceUpdate";

    newSettings.endpoints = {}
    newSettings.endpoints.rsi = "http://www.robertsspaceindustries.com";
    
    //Add additional levels and layers here. 
    return newSettings;
}

//Function for getting date and time. 
//Might need to move this somewhere more accessible.
function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return month + "/" + day + "/" + year + " " + hour + ":" + min + ":" + sec;

}