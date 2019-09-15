const _mysql = require('mysql');
const _config = require('../config/config.json');

const _procedures = {
    upsertMember: 'UpsertMember',
    getMemberTimeZone: 'GetMemberTimeZone',
    getDistinctTimeZonesByDiscordIds: 'GetDistinctTimeZonesByDiscordIds'
}

const _connection = _mysql.createConnection({
    host: _config.mysql.host,
    user: _config.mysql.user,
    password: _config.mysql.password,
    database: _config.mysql.database
});

_connection.connect();

async function setTimezone(userId, timezone) {
    let sql = `CALL ${_procedures.upsertMember}("${userId}", "${timezone}")`;
    return new Promise((resolve, reject) => {
        _connection.query(sql, function (error, results, fields) {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve();
        });
    });
}

async function getTimezone(userId) {
    let sql = `CALL ${_procedures.getMemberTimeZone}("${userId}")`;
    return new Promise((resolve, reject) => {
        _connection.query(sql, function (error, results, fields) {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }

            let table = results[0];
            if (table.length <= 0) {
                resolve();
            } else {
                let timezone = table[0]['TimeZone'];
                resolve(timezone);
            }
        });
    });
}

async function getActiveTimezones(guildUsers) {
    let memberDiscordIds = guildUsers.join(',');
    let sql = `CALL ${_procedures.getDistinctTimeZonesByDiscordIds}("${memberDiscordIds}")`;
    return new Promise((resolve, reject) => {
        _connection.query(sql, function (error, results, fields) {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }

            let timezones = results[0].map(result => result['TimeZone']);
            resolve(timezones);
        });
    });
}

module.exports = {
    setTimezone,
    getTimezone,
    getActiveTimezones
};
