const moment = require('moment-timezone');

var timezones = moment.tz.names().map(name => name.toLowerCase());

function findTimezone(timezone) {
    timezone = timezone.toLowerCase();
    if (timezones.includes(timezone)) {
        return moment.tz.zone(timezone);
    }

    var foundName = timezones.find(name => {
        return name.includes(timezone);
    });
    return moment.tz.zone(foundName);
}

function getTimeInTimezone(timezone, format) {
    return moment.tz(timezone).format(format);
}

function createTimeInTimezone(time, format, timezone) {
    return moment.tz(time, format, timezone);
}

module.exports = {
    findTimezone,
    getTimeInTimezone,
    createTimeInTimezone
};
