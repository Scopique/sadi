# S.A.D.I.
## Self-Aware Digital Interface - A Discord Bot for a Star Citizen Discord
_Currently built and hosted on repl.it_

## Public Functions
__!sadi ship [SHIPNAME]__

This will search the API for a _released_ ship and display the information in the current channel. 

[SHIPNAME] can be the ship's model (Constellation, Aurora) or a variant (Black, MR). It cannot be a full name (Constellation Taurus). Subsequent searches for the same model, whether by the original user or other users, will return the next variant in the list. When all variants have been returned, the list will loop back to the first.

_Search variations_

These shorthand switch variations allow for quicker input, and canbe used for advanced searching.

* -n: Query by the name of the ship. Same as !sadi ship [SHIPNAME]
* -m: Query my manufacturer name.
* -r: Query by ship's assigned role.
* -t: Query by ship type.

__!sadi system [SYSTEM_NAME]__

This searches the API for information about the provided star system. At the time of this update, there is only one playable system available (Stanton), although it seems that there are a lot of systems in the database. 

You can use the _-s_ switch in place of _system_ in the command for shorthand.

__!sadi object [OBJECT NAME]__

This command will search the API for an _object_ by name. An object in the API data refers to planets, stations, outposts, landing zones, etc. The success of this command will depend on the data backing the API, and at the time of this posting, the data was incomplete. 

You can use the _-o_ switch in place of _object_ in the command shorthand.

## Admin Functions

_Currently, anyone who knows about the admin functions can execute them. It is an obvious oversight._

__!setlobby [CHANNEL] [ROLE_TO_GRANT] | reset | remove__

With this command, a channel can be set as the "lobby" for new members. Using standard Discord invite rules, new users should be landed to this channel with a default role that has _no other access to the server._ 

Once the !setlobby command has been used, new visitors will be asked to review the EULA for the server (which you should provide in the landing channel) and given two reactions to click on: One to accept, and one to reject. If the user rejects the EULA, he should be kicked from the server (not currently implemened) and the action logged. If the user accepts the EULA, he is immediately granted the role specified in the [ROLE_TO_GRANT] parameter. This role should have wider access to the server. 

Specifying the _reset_ argument as the only argument to the comand will remove the existing post in the lobby channel and repost it at the very bottom of the channel. Use this to ensure that the reactions are placed as the last entry in the channel. 

You can remove the post and the lobby reference from the bot by using the _remove_ command as the only argument. This will de-register the channel as the lobby, and will remove the confirmation post. 

__!admin refresh [override]__

Using the _refresh_ command will attempt to re-download a local copy of the API data. By default, this is on a 24 hour limit timer so as not to overload good graces of the API. Adding the _override_ parameter to the end of the command, however, will force the bot to pull a refresh regardless of the timer. Please use sparingly. 

__!admin cleanup__

In order to prevent the bot from constantly pinging the API and to perform a data reorganization for the bot operations, S.A.D.I. will cache a local copy of the latest API data for ships, objects, and locations. Part of this process involves transforming the API data into a "flatter" structure that's quicker and easier for the bot to use. This process is called _cleaning the data_. This is automatically performed at the end of a _refresh_ operation, but should you need to convert the raw data files into the useable format, this command can be executed manually. If the files are up to date, then this process will simply overwrite the useable files with the exact same data. 

## CONFIG.json Format

The config.json is simple: One node, specifying what the command prefix should be.

{
    "prefix":"!"
}

## .env File Contents

There are several constants referenced in the .env file. As this is a more secure file, it's where the bot will pull things like the Discord and SCAPI client keys. 

Note that you will need to set up your own Discord dev account and register your own Discord bot account to get your secret and key. You will also need to register with SCAPI to get a key for their service as well. 

DISCORD_BOT_SECRET=[Discord issued secret key]

RSI_BASE_URI=https://www.robertsspaceindustries.com

SC_API_KEY=[SCAPI issued client key]

SC_API_SHIPS_URI=https://api.starcitizen-api.com/[SCAPI issued client key]/v1/cache/ships
SC_API_SYSTEMS_URI=https://api.starcitizen-api.com/[SCAPI issued client key]/v1/cache/starmap/systems
SC_API_TUNNELS_URI=https://api.starcitizen-api.com/[SCAPI issued client key]/v1/cache/starmap/tunnels
SC_API_SPECIES_URI=https://api.starcitizen-api.com/[SCAPI issued client key]/v1/cache/starmap/species
SC_API_AFFILIATIONS_URI=https://api.starcitizen-api.com/[SCAPI issued client key]/v1/cache/starmap/affiliations
SC_API_OBJECTS_URI=https://api.starcitizen-api.com/[SCAPI issued client key]/v1/cache/starmap/object
SC_API_SEARCHES_URI=https://api.starcitizen-api.com/[SCAPI issued client key]/v1/live/starmap/search
