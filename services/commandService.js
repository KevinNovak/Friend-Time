const _timeUtils = require('../utils/timeUtils');
const _regexUtils = require('../utils/regexUtils');
const _usersRepo = require('../repos/usersRepo');
const _config = require('../config/config.json');
const _lang = require('../config/lang.json');

const INTERNAL_DATE_FORMAT = 'YYYY-MM-DD';
const INTERNAL_TIME_FORMAT = 'h:mm A';
const MAX_MESSAGE_LENGTH = 2000;

let _helpMsg = _lang.msg.help.join('\n');
let _mapMsg = _lang.msg.map.join('\n');
let _inviteMsg = _lang.msg.invite.join('\n');
let _noTimezoneProvidedMsg = _lang.msg.noTimezoneProvided.join('\n');
let _invalidTimezoneMsg = _lang.msg.invalidTimezone.join('\n');
let _timezoneNotSetMsg = _lang.msg.timezoneNotSet.join('\n');

function processHelp(msg) {
    msg.channel.send(_helpMsg);
}

function processMap(msg) {
    msg.channel.send(_mapMsg);
}

async function processSet(msg, args) {
    if (msg.guild === null) {
        msg.channel.send(_lang.msg.notAllowedInDm);
        return;
    }

    if (args.length < 3) {
        msg.channel.send(_noTimezoneProvidedMsg);
        return;
    }

    let userTimezone = args.slice(2).join(' ');
    let timezone = _timeUtils.findTimezone(userTimezone);
    if (!timezone) {
        msg.channel.send(_invalidTimezoneMsg);
        return;
    }

    await _usersRepo.setTimezone(msg.author.id, timezone.name);

    msg.channel.send(
        _lang.msg.updatedTimezone.replace('{TIMEZONE}', timezone.name)
    );
    console.log(
        _lang.log.userSetTimezone
            .replace('{SHARD_ID}', msg.client.shard.id)
            .replace('{USERNAME}', msg.author.username)
            .replace('{USER_ID}', msg.author.id)
            .replace('{TIMEZONE}', timezone.name)
            .replace('{SERVER_NAME}', msg.guild.name)
            .replace('{SERVER_ID}', msg.guild.id)
    );
}

function processInvite(msg) {
    msg.channel.send(_inviteMsg);
}

function predictTime(userTimezone, msg) {
    let currentDay = _timeUtils.getTimeInTimezone(
        userTimezone,
        INTERNAL_DATE_FORMAT
    );

    let match = _regexUtils.matchTime(msg);
    let hour = match[1];
    let minutes = match[2] ? match[2] : ':00';
    let dayNight = match[3].toUpperCase();

    let predictedDateTimeString = `${currentDay} ${hour}${minutes} ${dayNight}`;
    return _timeUtils.createTimeInTimezone(
        predictedDateTimeString,
        `${INTERNAL_DATE_FORMAT} ${INTERNAL_TIME_FORMAT}`,
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

    let userTimezone = await _usersRepo.getTimezone(msg.author.id);

    if (!userTimezone) {
        let timezoneNotSet = _timezoneNotSetMsg.replace(
            '{USERNAME}',
            msg.author.username
        );
        msg.channel.send(timezoneNotSet);
        return;
    }

    let predictedTime = predictTime(userTimezone, msg.content);

    let guildUsers = msg.guild.members.keyArray();

    let activeTimezones = await _usersRepo.getActiveTimezones(guildUsers);
    let activeTimezoneData = activeTimezones
        .map(name => ({
            name,
            time: predictedTime.tz(name).format(_config.timeFormat),
            offset: parseInt(predictedTime.tz(name).format('ZZ'))
        }))
        .sort(compareTimezones);

    let message = '';
    for (let data of activeTimezoneData) {
        let line = `${_lang.msg.convertedTime
            .replace('{TIMEZONE}', data.name)
            .replace('{TIME}', data.time)}\n`;
        if (message.length + line.length > MAX_MESSAGE_LENGTH) {
            msg.channel.send(message);
            message = '';
        }
        message += line;
    }
    if (message.length > 1) {
        msg.channel.send(message);
    }
}

module.exports = {
    processHelp,
    processMap,
    processSet,
    processInvite,
    processTime
};
