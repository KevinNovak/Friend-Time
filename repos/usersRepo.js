const mysql = require('mysql');
const config = require('../config/config.json');

const procedures = {
    upsertMember: 'UpsertMember',
    getMemberTimeZone: 'GetMemberTimeZone'
}

const connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

connection.connect();

async function setTimezone(userId, timezone) {
    let sql = `CALL ${procedures.upsertMember}("${userId}", "${timezone}")`;
    return new Promise((resolve, reject) => {
        connection.query(sql, function (error, results, fields) {
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
    let sql = `CALL ${procedures.getMemberTimeZone}("${userId}")`;
    return new Promise((resolve, reject) => {
        connection.query(sql, function (error, results, fields) {
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
    let sql = `CALL GetDistinctTimeZonesByDiscordIds("${memberDiscordIds}")`;
    return new Promise((resolve, reject) => {
        connection.query(sql, function (error, results, fields) {
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
