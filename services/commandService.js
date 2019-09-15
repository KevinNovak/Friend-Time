const timeUtils = require('../utils/timeUtils');
const regexUtils = require('../utils/regexUtils');
const usersRepo = require('../repos/usersRepo');
const config = require('../config/config.json');
const lang = require('../config/lang.json');

const internalDateFormat = 'YYYY-MM-DD';
const internalTimeFormat = 'h:mm A';

let helpMsg = lang.msg.help.join('\n');
let mapMsg = lang.msg.map.join('\n');
let inviteMsg = lang.msg.invite.join('\n');
let noTimezoneProvidedMsg = lang.msg.noTimezoneProvided.join('\n');
let invalidTimezoneMsg = lang.msg.invalidTimezone.join('\n');
let timezoneNotSetMsg = lang.msg.timezoneNotSet.join('\n');

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

    let userTimezone = args.slice(2).join(' ');
    let timezone = timeUtils.findTimezone(userTimezone);
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
    let currentDay = timeUtils.getTimeInTimezone(
        userTimezone,
        internalDateFormat
    );

    let match = regexUtils.matchTime(msg);
    let hour = match[1];
    let minutes = match[2] ? match[2] : ':00';
    let dayNight = match[3].toUpperCase();

    let predictedDateTimeString = `${currentDay} ${hour}${minutes} ${dayNight}`;
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

    let userTimezone = await usersRepo.getTimezone(msg.author.id);

    if (!userTimezone) {
        let timezoneNotSet = timezoneNotSetMsg.replace(
            '{USERNAME}',
            msg.author.username
        );
        msg.channel.send(timezoneNotSet);
        return;
    }

    let predictedTime = predictTime(userTimezone, msg.content);

    let guildUsers = msg.guild.members.keyArray();

    let activeTimezones = await usersRepo.getActiveTimezones(guildUsers);
    let activeTimezoneData = activeTimezones
        .map(name => ({
            name,
            time: predictedTime.tz(name).format(config.timeFormat),
            offset: parseInt(predictedTime.tz(name).format('ZZ'))
        }))
        .sort(compareTimezones);

    let message = '';
    for (let data of activeTimezoneData) {
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
