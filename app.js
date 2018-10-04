const Discord = require('discord.js');
const moment = require('moment-timezone');
const users = require('./repositories/users');
const config = require('./config/config.json');
const lang = require('./config/lang.json');

const client = new Discord.Client();

const timeRegex = /\b([1-9]|1[0-2])(:\d{2})?\s*(a|p|am|pm)\b/i;
const dateFormat = 'YYYY-MM-DD';
const timeFormat = 'h:mm a';

client.on('ready', () => {
    var userTag = client.user.tag;
    console.log(lang.log.login.replace('{USER_TAG}', userTag));
});

client.on('message', msg => {
    processMessage(msg);
});

function messageContainsTime(msg) {
    return timeRegex.test(msg);
}

function findTimezone(userTimezone) {
    return moment.tz.zone(userTimezone);
}

function processRegister(msg) {
    var delimiter = ' ';
    var contents = msg.content.split(delimiter);
    if (contents.length < 2) {
        msg.channel.send(lang.msg.noTimezoneProvided);
        return;
    }
    contents.shift();

    var userTimezone = contents.join(delimiter);
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

function processTime(msg) {
    var userTimezone = users.getTimezone(msg.author.id);

    if (!userTimezone) {
        // No timezone set for this user
        return;
    }

    var currentDay = moment.tz(userTimezone).format(dateFormat);
    var match = timeRegex.exec(msg.content);
    var hour = match[1];
    var minutes = match[2] ? match[2] : ':00';
    var dayNight = match[3].toUpperCase();
    var predictedDateTimeString = `${currentDay} ${hour}${minutes} ${dayNight}`;
    var predictedDateTime = moment.tz(
        predictedDateTimeString,
        `${dateFormat} h:mm A`,
        userTimezone
    );

    var message = '';
    for (var timezone of users.getActiveTimezones()) {
        var time = predictedDateTime.tz(timezone).format(timeFormat);
        message += `**${timezone}**: ${time}\n`;
    }
    msg.channel.send(message);
}

function processMessage(msg) {
    var msgContent = msg.content;
    if (msgContent.startsWith(`!${lang.cmd.register}`)) {
        processRegister(msg);
        return;
    }

    if (messageContainsTime(msgContent)) {
        processTime(msg);
        return;
    }
}

client.login(config.token);
