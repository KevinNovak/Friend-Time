const Discord = require('discord.js');
const moment = require('moment-timezone');
const users = require('./users');
const config = require('./config.json');

const client = new Discord.Client();

const timeRegex = /\b([1-9]|1[0-2])(:\d{2})?\s*(a|p|am|pm)\b/i;
const dateFormat = 'YYYY-MM-DD';
const timeFormat = 'h:mm a';

client.on('ready', () => {
    var userTag = client.user.tag;
    console.log(`Logged in as ${userTag}!`);
});

client.on('message', msg => {
    processMessage(msg);
});

function messageContainsTime(msg) {
    return timeRegex.test(msg);
}

function validTimezone(timezone) {
    return moment.tz.names().includes(timezone);
}

function processMessage(msg) {
    var msgContent = msg.content;
    var userId = msg.author.id;

    if (msgContent.startsWith('register ')) {
        var contents = msgContent.split(' ');
        var timezone = contents[1];
        if (!validTimezone(timezone)) {
            msg.channel.send('Invalid timezone.');
            return;
        }
        users.setTimezone(userId, timezone);
        msg.channel.send(`Updated your timezone to **${timezone}**.`);
    }

    if (!messageContainsTime(msgContent)) {
        return;
    }

    var userTimezone = users.getTimezone(userId);

    if (!userTimezone) {
        return;
    }

    if (!validTimezone(userTimezone)) {
        return;
    }

    var currentDay = moment.tz(userTimezone).format(dateFormat);
    var match = timeRegex.exec(msgContent);
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
        if (!validTimezone(timezone)) {
            return;
        }
        var time = predictedDateTime.tz(timezone).format(timeFormat);
        message += `**${timezone}**: ${time}\n`;
    }
    msg.channel.send(message);
}

client.login(config.token);
