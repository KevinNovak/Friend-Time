const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const usersFile = new FileSync('./data/users.json');
const usersDb = low(usersFile);

function getTimezone(userId) {
    var user = usersDb.find({ id: userId }).value();
    if (user) {
        return user.timezone;
    }
}

function getActiveTimezones() {
    return new Set(usersDb.map(user => user.timezone).sort());
}

function setTimezone(userId, timezone) {
    if (usersDb.find({ id: userId }).value()) {
        usersDb
            .find({ id: userId })
            .assign({ timezone: timezone })
            .write();
    } else {
        usersDb.push({ id: userId, timezone: timezone }).write();
    }
}

module.exports = {
    getTimezone,
    getActiveTimezones,
    setTimezone
};
