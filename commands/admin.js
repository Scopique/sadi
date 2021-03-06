const scapi = require("../lib/scapi");

module.exports = {
    name:"admin",
    cmd:"admin",
    description:"Super secret administration commands",
    args: false,
    usage: "!admin [COMMAND]",
    execute( message, args, core)
    {
      const {client: client, settings, setting} = core;
      
      if (args.length == 0){
        //No args, so what do you want?
      }else if (args.length == 1){
        //Just one arg
        switch (args[0]){
          case "refresh":
            scapi.RefreshAPIData()
            break;
          case "cleanup":
            scapi.CleanFiles();
            break;
        }
      }else if (args.length > 1){
        //Multiple. We can override the refresh timer
        switch(args[0]){
          case "refresh":
            if (args[1].toLowerCase() == "override")
            {
              scapi.RefreshAPIData(true);
            
            break;
            }
        }
      }
    }  
}