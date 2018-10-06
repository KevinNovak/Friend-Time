const moment = require('moment-timezone');

function findTimezone(timezone) {
    return moment.tz.zone(timezone);
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
