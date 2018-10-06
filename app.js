const Discord = require('discord.js');
const moment = require('moment-timezone');
const users = require('./repositories/users');
const config = require('./config/config.json');
const lang = require('./config/lang.json');

const client = new Discord.Client();
const timeRegex = /\b([1-9]|1[0-2])(:\d{2})?\s*(a|p|am|pm)\b/i;
const internalDateFormat = 'YYYY-MM-DD';
const internalTimeFormat = 'h:mm A';
const stringDelimiter = ' ';

var helpMessage = '';

client.on('ready', () => {
    var userTag = client.user.tag;
    console.log(lang.log.login.replace('{USER_TAG}', userTag));
});

client.on('message', msg => {
    processMessage(msg);
});

function setup() {
    for (var message of lang.msg.help) {
        helpMessage += `${message}\n`;
    }
}

function messageContainsTime(msg) {
    return timeRegex.test(msg);
}

function findTimezone(userTimezone) {
    return moment.tz.zone(userTimezone);
}

function processRegister(msg) {
    var contents = msg.content.split(stringDelimiter);
    if (contents.length < 3) {
        msg.channel.send(lang.msg.noTimezoneProvided);
        return;
    }
    contents.shift();
    contents.shift();

    var userTimezone = contents.join(stringDelimiter);
    var timezone = findTimezone(userTimezone);
    if (!timezone) {
        msg.channel.send(lang.msg.invalidTimezone);
        return;
    }

    users.setTimezone(msg.author.id, timezone.name);
    msg.channel.send(
        lang.msg.updatedTimezone.replace('{TIMEZONE}', timezone.name)
    );
}

function processHelp(msg) {
    msg.channel.send(helpMessage);
}

function processTime(msg) {
    var userTimezone = users.getTimezone(msg.author.id);

    if (!userTimezone) {
        // No timezone set for this user
        return;
    }

    var currentDay = moment.tz(userTimezone).format(internalDateFormat);
    var match = timeRegex.exec(msg.content);
    var hour = match[1];
    var minutes = match[2] ? match[2] : ':00';
    var dayNight = match[3].toUpperCase();
    var predictedDateTimeString = `${currentDay} ${hour}${minutes} ${dayNight}`;
    var predictedDateTime = moment.tz(
        predictedDateTimeString,
        `${internalDateFormat} ${internalTimeFormat}`,
        userTimezone
    );

    var message = '';
    for (var timezone of users.getActiveTimezones()) {
        var time = predictedDateTime.tz(timezone).format(config.timeFormat);
        message += `${lang.msg.convertedTime
            .replace('{TIMEZONE}', timezone)
            .replace('{TIME}', time)}\n`;
    }
    msg.channel.send(message);
}

function processMessage(msg) {
    var msgContent = msg.content;
    if (msgContent.startsWith(`${lang.cmd.prefix} ${lang.cmd.register}`)) {
        processRegister(msg);
        return;
    }

    if (msgContent.startsWith(`${lang.cmd.prefix} ${lang.cmd.help}`)) {
        processHelp(msg);
        return;
    }

    if (messageContainsTime(msgContent)) {
        processTime(msg);
        return;
    }
}

setup();
client.login(config.token).catch(error => {
    console.error(lang.log.loginFailed);
});
