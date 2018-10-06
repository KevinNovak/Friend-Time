const timezoneUtils = require('../utils/timezoneUtils');
const regexUtils = require('../utils/regexUtils');
const usersRepo = require('../repos/usersRepo');
const config = require('../config/config.json');
const lang = require('../config/lang.json');

const internalDateFormat = 'YYYY-MM-DD';
const internalTimeFormat = 'h:mm A';
const stringDelimiter = ' ';

var helpMessage = '';

function setup() {
    for (var message of lang.msg.help) {
        helpMessage += `${message}\n`;
    }
}

function processHelp(msg) {
    msg.channel.send(helpMessage);
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
    var timezone = timezoneUtils.findTimezone(userTimezone);
    if (!timezone) {
        msg.channel.send(lang.msg.invalidTimezone);
        return;
    }

    usersRepo.setTimezone(msg.author.id, timezone.name);
    msg.channel.send(
        lang.msg.updatedTimezone.replace('{TIMEZONE}', timezone.name)
    );
}

function processTime(msg) {
    var userTimezone = usersRepo.getTimezone(msg.author.id);

    if (!userTimezone) {
        // No timezone set for this user
        return;
    }

    var currentDay = timezoneUtils.getTimeInTimezone(
        userTimezone,
        internalDateFormat
    );
    var match = regexUtils.matchTime(msg.content);
    var hour = match[1];
    var minutes = match[2] ? match[2] : ':00';
    var dayNight = match[3].toUpperCase();
    var predictedDateTimeString = `${currentDay} ${hour}${minutes} ${dayNight}`;
    var predictedDateTime = timezoneUtils.createTimeInTimezone(
        predictedDateTimeString,
        `${internalDateFormat} ${internalTimeFormat}`,
        userTimezone
    );

    var message = '';
    for (var timezone of usersRepo.getActiveTimezones()) {
        var time = predictedDateTime.tz(timezone).format(config.timeFormat);
        message += `${lang.msg.convertedTime
            .replace('{TIMEZONE}', timezone)
            .replace('{TIME}', time)}\n`;
    }
    msg.channel.send(message);
}

setup();
module.exports = {
    processHelp,
    processRegister,
    processTime
};
