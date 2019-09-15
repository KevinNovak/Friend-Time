const _moment = require('moment-timezone');
const _regions = require('../config/config.json').regions;

let timezones = _moment.tz
    .names()
    .filter(name => _regions.some(region => name.startsWith(`${region}/`)))
    .map(name => name.toLowerCase());

function findTimezone(timezone) {
    timezone = timezone
        .split(' ')
        .join('_')
        .toLowerCase();
    if (timezones.includes(timezone)) {
        return _moment.tz.zone(timezone);
    }

    let foundName = timezones.find(name => {
        return name.includes(timezone);
    });
    return _moment.tz.zone(foundName);
}

function getTimeInTimezone(timezone, format) {
    return _moment.tz(timezone).format(format);
}

function createTimeInTimezone(time, format, timezone) {
    return _moment.tz(time, format, timezone);
}

module.exports = {
    findTimezone,
    getTimeInTimezone,
    createTimeInTimezone
};
