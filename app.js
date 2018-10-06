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
    var msgContent = msg.content;
    if (msgContent.startsWith(`${lang.cmd.prefix} ${lang.cmd.register}`)) {
        commandService.processRegister(msg);
        return;
    }

    if (msgContent.startsWith(`${lang.cmd.prefix} ${lang.cmd.timezones}`)) {
        commandService.processTimezones(msg);
        return;
    }

    if (msgContent.startsWith(`${lang.cmd.prefix} ${lang.cmd.help}`)) {
        commandService.processHelp(msg);
        return;
    }

    if (regexUtils.containsTime(msgContent)) {
        commandService.processTime(msg);
        return;
    }
});

client.login(config.token).catch(error => {
    console.error(lang.log.loginFailed);
});
