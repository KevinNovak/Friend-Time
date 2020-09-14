# Friend Time

[![top.gg](https://top.gg/api/widget/status/471091072546766849.svg?noavatar=true)](https://top.gg/bot/471091072546766849)[![top.gg](https://top.gg/api/widget/servers/471091072546766849.svg?noavatar=true)](https://top.gg/bot/471091072546766849)[![discord.js](https://img.shields.io/github/package-json/dependency-version/KevinNovak/Friend-Time/discord.js)](https://discord.js.org/)

**Discord bot** - Automatically convert times mentioned in chat between time zones!

## [Add to your Discord Server!](https://discordapp.com/oauth2/authorize?client_id=471091072546766849&scope=bot&permissions=85056)

[Join Support Server](https://discord.gg/GQcBR8e) | [Donate with PayPal!](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=EW389DYYSS4FC)

If you have a discord server with users across multiple countries and time zones then this is the bot for you! With Friend Time you can easily coordinate times between users. Friend Time will automatically convert any times mentioned in chat to the times of other users.

Friend Time will automatically react with a clock emoji to times mentioned in chat:

![Example usage](https://i.imgur.com/wyxFxEr.png)

By also reacting, you will be private messaged with the time converted to your time zone:

![Example conversion](https://i.imgur.com/wveOlPz.png)

## Commands

### Help Command

* `-ft` - Show the help menu.

### Core Commands

* `-ft set <zone>` - Set yourself to a time zone.
* `-ft map` - View a map of available time zones.
* `-ft clear` - Clear your time zone.
* `-ft time` - Get the current time.
* `-ft time <user>` - Get the current time of a user.
* `-ft time <zone>` - Get the current time of a time zone.
* `-ft format <12/24>` - Set your time format, 12 or 24 hours.
* `-ft config` - Change server settings, for admins.
* `-ft info` - More information about Friend Time.

### Config Commands

* `-ft config mode <react/list>` - Change the mode that is used for converting times.
* `-ft config format <12/24>` - Change the servers time format, 12 or 24 hours.
* `-ft config notify <on/off>` - Enable or disable reminders for users who don't have a time zone set.

### Info Commands

* `-ft invite` - Invite Friend Time to your server.
* `-ft support` - Get help or report an issue.
* `-ft donate` - Donate to keep Friend Time running!

## Finding Your Time Zone

Visit the following link to view a map of available time zones:

<https://kevinnovak.github.io/Time-Zone-Picker/>

Simply click your location on the map, and use the name displayed in "Selected Time Zone" as your time zone.

You can then take your time zone name and run the **set** command like so:
`-ft set America/New_York`

![Setting your time zone](https://i.imgur.com/LgaPfp6.png)

Friend Time will then know your time zone and use this to automatically convert any times you mention in chat, as well as convert other users times to your time zone.

## Permissions

Friend Time requires the following permissions:

1. **Read Messages**
2. **Send Messages**
3. **Embed Links**
4. **Read Message History**
5. **Add Reactions**

When you invite Friend Time to your server, by default all of these permissions should be given to Friend Time. If you'd like to disable Friend Time for certain channels, feel free to remove these permissions in the channels you'd like to disable. If you are experiencing permissions issues, feel free to kick and reinvite Friend Time.

## Self-Hosting

If you'd like to run your own copy of Friend Time for development or personal reasons, see the [following guide](docs/self-hosting.md).

## References

* [discord.js](https://discord.js.org/) - A powerful JavaScript library for interacting with the Discord API.
* [Chrono](https://github.com/wanasit/chrono) - A natural language date parser in JavaScript.
* [Moment Timezone](https://momentjs.com/timezone/) - Parse and display dates in any time zone.
