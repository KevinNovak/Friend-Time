const Discord = require('discord.js');
const commandService = require('./services/commandService');
const regexUtils = require('./utils/regexUtils');
const config = require('./config/config.json');
const lang = require('./config/lang.json');

const client = new Discord.Client();

client.on('ready', () => {
    var userTag = client.user.tag;
    console.log(lang.log.login.replace('{USER_TAG}', userTag));
});

client.on('message', msg => {
    if (msg.author.bot) {
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

client.login(config.token).catch(error => {
    console.error(lang.log.loginFailed);
});
