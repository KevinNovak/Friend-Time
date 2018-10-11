const Discord = require('discord.js');
const DBL = require('dblapi.js');
const commandService = require('./services/commandService');
const usersRepo = require('./repos/usersRepo');
const regexUtils = require('./utils/regexUtils');
const config = require('./config/config.json');
const lang = require('./config/lang.json');

const client = new Discord.Client();

if (config.discordBotList.enabled) {
    const dbl = new DBL(config.discordBotList.token, client);

    dbl.on('posted', () => {
        console.log('Server count posted to Discord Bot List!');
    });

    dbl.on('error', error => {
        console.error('Failed to connect to Discord Bot List!');
        console.error(error);
    });
}

var acceptMessages = false;

function getConnectedServerIds() {
    return client.guilds.keyArray();
}

function updateConnectedServers(serverCount) {
    client.user.setPresence({
        game: {
            name: `time to ${serverCount.toLocaleString()} servers`,
            type: 'STREAMING',
            url: 'https://www.twitch.tv/monstercat'
        }
    });
}

client.on('ready', () => {
    var userTag = client.user.tag;
    console.log(lang.log.login.replace('{USER_TAG}', userTag));

    var serverIds = getConnectedServerIds();
    usersRepo.connectServers(serverIds);

    var serverCount = serverIds.length;
    updateConnectedServers(serverCount);
    console.log(
        lang.log.connectedServers.replace('{SERVER_COUNT}', serverCount)
    );

    acceptMessages = true;
    console.log(lang.log.startupComplete);
});

client.on('message', msg => {
    if (!acceptMessages || msg.author.bot) {
        return;
    }

    if (regexUtils.containsTime(msg.content)) {
        commandService.processTime(msg);
        return;
    }

    var args = msg.content.split(' ');
    if (!lang.cmd.prefix.includes(args[0].toLowerCase())) {
        return;
    }

    if (args.length > 1) {
        var cmd = args[1].toLowerCase();
        if (lang.cmd.help.includes(cmd)) {
            commandService.processHelp(msg);
            return;
        }

        if (lang.cmd.map.includes(cmd)) {
            commandService.processMap(msg);
            return;
        }

        if (lang.cmd.set.includes(cmd)) {
            commandService.processSet(msg, args);
            return;
        }
    }

    commandService.processHelp(msg);
});

client.on('guildCreate', guild => {
    usersRepo.connectServer(guild.id);
    var serverCount = getConnectedServerIds().length;
    updateConnectedServers(serverCount);
    console.log(
        lang.log.serverConnected
            .replace('{SERVER_NAME}', guild.name)
            .replace('{SERVER_ID}', guild.id)
            .replace('{SERVER_COUNT}', serverCount)
    );
});

client.on('guildDelete', guild => {
    var serverCount = getConnectedServerIds().length;
    updateConnectedServers(serverCount);
    console.log(
        lang.log.serverDisconnected
            .replace('{SERVER_NAME}', guild.name)
            .replace('{SERVER_ID}', guild.id)
            .replace('{SERVER_COUNT}', serverCount)
    );
});

client.login(config.token).catch(error => {
    console.error(lang.log.loginFailed);
    console.error(error);
});
