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

        if (lang.cmd.timezones.includes(cmd)) {
            commandService.processTimezones(msg);
            return;
        }

        if (lang.cmd.register.includes(cmd)) {
            commandService.processRegister(msg, args);
            return;
        }

        if (regexUtils.containsTime(args)) {
            commandService.processTime(msg);
            return;
        }
    }

    commandService.processHelp(msg);
});

client.login(config.token).catch(error => {
    console.error(lang.log.loginFailed);
});
