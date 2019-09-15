const moment = require('moment-timezone');
const regions = require('../config/config.json').regions;

let timezones = moment.tz
    .names()
    .filter(name => regions.some(region => name.startsWith(`${region}/`)))
    .map(name => name.toLowerCase());

function findTimezone(timezone) {
    timezone = timezone
        .split(' ')
        .join('_')
        .toLowerCase();
    if (timezones.includes(timezone)) {
        return moment.tz.zone(timezone);
    }

    let foundName = timezones.find(name => {
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
