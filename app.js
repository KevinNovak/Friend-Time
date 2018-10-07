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
    if (!lang.cmd.prefix.includes(args[0])) {
        return;
    }

    if (args[1] == lang.cmd.help) {
        commandService.processHelp(msg);
        return;
    }

    if (args[1] == lang.cmd.register) {
        commandService.processRegister(msg);
        return;
    }

    if (args[1] == lang.cmd.timezones) {
        commandService.processTimezones(msg);
        return;
    }

    if (regexUtils.containsTime(args)) {
        commandService.processTime(msg);
        return;
    }

    commandService.processHelp(msg);
});

client.login(config.token).catch(error => {
    console.error(lang.log.loginFailed);
});
