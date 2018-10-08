const Discord = require('discord.js');
const commandService = require('./services/commandService');
const usersRepo = require('./repos/usersRepo');
const regexUtils = require('./utils/regexUtils');
const config = require('./config/config.json');
const lang = require('./config/lang.json');

const client = new Discord.Client();

var acceptMessages = false;

client.on('ready', () => {
    var userTag = client.user.tag;
    console.log(lang.log.login.replace('{USER_TAG}', userTag));

    var serverIds = client.guilds.keyArray();
    console.log(
        lang.log.connectedServers.replace('{SERVER_COUNT}', serverIds.length)
    );

    usersRepo.connectServers(serverIds);
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
    console.log(
        lang.log.serverConnected
            .replace('{SERVER_NAME}', guild.name)
            .replace('{SERVER_ID}', guild.id)
    );
});

client.login(config.token).catch(error => {
    console.error(lang.log.loginFailed);
});
