const timeUtils = require('../utils/timeUtils');
const regexUtils = require('../utils/regexUtils');
const usersRepo = require('../repos/usersRepo');
const config = require('../config/config.json');
const lang = require('../config/lang.json');

const internalDateFormat = 'YYYY-MM-DD';
const internalTimeFormat = 'h:mm A';

var helpMsg = lang.msg.help.join('\n');
var mapMsg = lang.msg.map.join('\n');
var inviteMsg = lang.msg.invite.join('\n');
var noTimezoneProvidedMsg = lang.msg.noTimezoneProvided.join('\n');
var invalidTimezoneMsg = lang.msg.invalidTimezone.join('\n');
var timezoneNotSetMsg = lang.msg.timezoneNotSet.join('\n');

function processHelp(msg) {
    msg.channel.send(helpMsg);
}

function processMap(msg) {
    msg.channel.send(mapMsg);
}

async function processSet(msg, args) {
    if (msg.guild === null) {
        msg.channel.send(lang.msg.notAllowedInDm);
        return;
    }

    if (args.length < 3) {
        msg.channel.send(noTimezoneProvidedMsg);
        return;
    }

    var userTimezone = args.slice(2).join(' ');
    var timezone = timeUtils.findTimezone(userTimezone);
    if (!timezone) {
        msg.channel.send(invalidTimezoneMsg);
        return;
    }

    await usersRepo.setTimezone(msg.author.id, timezone.name);

    msg.channel.send(
        lang.msg.updatedTimezone.replace('{TIMEZONE}', timezone.name)
    );
    console.log(
        lang.log.userSetTimezone
            .replace('{USERNAME}', msg.author.username)
            .replace('{USER_ID}', msg.author.id)
            .replace('{TIMEZONE}', timezone.name)
            .replace('{SERVER_NAME}', msg.guild.name)
            .replace('{SERVER_ID}', msg.guild.id)
    );
}

function processInvite(msg) {
    msg.channel.send(inviteMsg);
}

function predictTime(userTimezone, msg) {
    var currentDay = timeUtils.getTimeInTimezone(
        userTimezone,
        internalDateFormat
    );

    var match = regexUtils.matchTime(msg);
    var hour = match[1];
    var minutes = match[2] ? match[2] : ':00';
    var dayNight = match[3].toUpperCase();

    var predictedDateTimeString = `${currentDay} ${hour}${minutes} ${dayNight}`;
    return timeUtils.createTimeInTimezone(
        predictedDateTimeString,
        `${internalDateFormat} ${internalTimeFormat}`,
        userTimezone
    );
}

function compareTimezones(a, b) {
    if (a.offset > b.offset) {
        return 1;
    }
    if (a.offset < b.offset) {
        return -1;
    }
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}

async function processTime(msg) {
    if (msg.guild === null) {
        return;
    }

    var userTimezone = await usersRepo.getTimezone(msg.author.id);

    if (!userTimezone) {
        var timezoneNotSet = timezoneNotSetMsg.replace(
            '{USERNAME}',
            msg.author.username
        );
        msg.channel.send(timezoneNotSet);
        return;
    }

    var predictedTime = predictTime(userTimezone, msg.content);

    var guildUsers = msg.guild.members.keyArray();

    var activeTimezones = await usersRepo.getActiveTimezones(guildUsers);
    var activeTimezoneData = activeTimezones
        .map(name => ({
            name,
            time: predictedTime.tz(name).format(config.timeFormat),
            offset: parseInt(predictedTime.tz(name).format('ZZ'))
        }))
        .sort(compareTimezones);

    var message = '';
    for (var data of activeTimezoneData) {
        message += `${lang.msg.convertedTime
            .replace('{TIMEZONE}', data.name)
            .replace('{TIME}', data.time)}\n`;
    }
    msg.channel.send(message);
}

module.exports = {
    processHelp,
    processMap,
    processSet,
    processInvite,
    processTime
};
