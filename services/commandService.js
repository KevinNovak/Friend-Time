const timezoneUtils = require('../utils/timezoneUtils');
const regexUtils = require('../utils/regexUtils');
const usersRepo = require('../repos/usersRepo');
const config = require('../config/config.json');
const lang = require('../config/lang.json');

const internalDateFormat = 'YYYY-MM-DD';
const internalTimeFormat = 'h:mm A';
const stringDelimiter = ' ';

var helpMsg = lang.msg.help.join('\n');
var timezonesMsg = lang.msg.timezones.join('\n');
var noTimezoneProvidedMsg = lang.msg.noTimezoneProvided.join('\n');
var invalidTimezoneMsg = lang.msg.invalidTimezone.join('\n');

function processHelp(msg) {
    msg.channel.send(helpMsg);
}

function processTimezones(msg) {
    msg.channel.send(timezonesMsg);
}

function processRegister(msg) {
    var contents = msg.content.split(stringDelimiter);
    if (contents.length < 3) {
        msg.channel.send(noTimezoneProvidedMsg);
        return;
    }

    var userTimezone = contents[2];
    var timezone = timezoneUtils.findTimezone(userTimezone);
    if (!timezone) {
        msg.channel.send(invalidTimezoneMsg);
        return;
    }

    usersRepo.setTimezone(msg.author.id, timezone.name);
    msg.channel.send(
        lang.msg.updatedTimezone.replace('{TIMEZONE}', timezone.name)
    );
}

function predictTime(userTimezone, msg) {
    var currentDay = timezoneUtils.getTimeInTimezone(
        userTimezone,
        internalDateFormat
    );

    var match = regexUtils.matchTime(msg);
    var hour = match[1];
    var minutes = match[2] ? match[2] : ':00';
    var dayNight = match[3].toUpperCase();

    var predictedDateTimeString = `${currentDay} ${hour}${minutes} ${dayNight}`;
    return timezoneUtils.createTimeInTimezone(
        predictedDateTimeString,
        `${internalDateFormat} ${internalTimeFormat}`,
        userTimezone
    );
}

function processTime(msg) {
    var userTimezone = usersRepo.getTimezone(msg.author.id);

    if (!userTimezone) {
        // No timezone set for this user
        return;
    }

    var predictedTime = predictTime(userTimezone, msg.content);

    var message = '';
    for (var timezone of usersRepo.getActiveTimezones()) {
        var time = predictedTime.tz(timezone).format(config.timeFormat);
        message += `${lang.msg.convertedTime
            .replace('{TIMEZONE}', timezone)
            .replace('{TIME}', time)}\n`;
    }
    msg.channel.send(message);
}

module.exports = {
    processHelp,
    processTimezones,
    processRegister,
    processTime
};
