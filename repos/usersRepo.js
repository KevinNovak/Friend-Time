const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fileUtils = require('../utils/fileUtils');

const users = {};

function connectServer(serverId) {
    var usersPath = fileUtils.getFullPath(`../data/${serverId}/users.json`);
    fileUtils.createIfNotExists(usersPath, JSON.stringify([]));
    var usersFile = new FileSync(usersPath);
    var usersDb = low(usersFile);
    users[serverId] = usersDb;
}

function connectServers(serverIds) {
    for (var serverId of serverIds) {
        connectServer(serverId);
    }
}

function getTimezone(serverId, userId) {
    var user = users[serverId].find({ id: userId }).value();
    if (user) {
        return user.timezone;
    }
}

function getActiveTimezones(serverId) {
    return [...new Set(users[serverId].map(user => user.timezone))];
}

function setTimezone(serverId, userId, timezone) {
    if (users[serverId].find({ id: userId }).value()) {
        users[serverId]
            .find({ id: userId })
            .assign({ timezone: timezone })
            .write();
    } else {
        users[serverId].push({ id: userId, timezone: timezone }).write();
    }
}

module.exports = {
    connectServer,
    connectServers,
    getTimezone,
    getActiveTimezones,
    setTimezone
};
