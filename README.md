# S.A.D.I.
## Self-Aware Digital Interface - A Discord Bot for a Star Citizen Discord
_Currently built and hosted on repl.it_

## Public Functions
__!sadi ship [SHIPNAME]__

This will search the API for a _released_ ship and display the information in the current channel. 

[SHIPNAME] can be the ship's model (Constellation, Aurora) or a variant (Black, MR). It cannot be a full name (Constellation Taurus). Subsequent searches for the same model, whether by the original user or other users, will return the next variant in the list. When all variants have been returned, the list will loop back to the first.

__!sadi system [SYSTEM_NAME]__

This searches the API for information about the provided star system. At the time of this update, there is only one playable system available (Stanton), although it seems that there are a lot of systems in the database. 

## Admin Functions

_Currently, anyone who knows about the admin functions can execute them. It is an obvious oversight._

__!setlobby [CHANNEL] [ROLE_TO_GRANT] | reset | remove__

With this command, a channel can be set as the "lobby" for new members. Using standard Discord invite rules, new users should be landed to this channel with a default role that has _no other access to the server._ 

Once the !setlobby command has been used, new visitors will be asked to review the EULA for the server (which you should provide in the landing channel) and given two reactions to click on: One to accept, and one to reject. If the user rejects the EULA, he should be kicked from the server (not currently implemened) and the action logged. If the user accepts the EULA, he is immediately granted the role specified in the [ROLE_TO_GRANT] parameter. This role should have wider access to the server. 

Specifying the _reset_ argument as the only argument to the comand will remove the existing post in the lobby channel and repost it at the very bottom of the channel. Use this to ensure that the reactions are placed as the last entry in the channel. 

You can remove the post and the lobby reference from the bot by using the _remove_ command as the only argument. This will de-register the channel as the lobby, and will remove the confirmation post. 
