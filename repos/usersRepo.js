const mysql = require('mysql');
const config = require('../config/config.json');

const connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

connection.connect();

function setTimezone(userId, timezone) {
    let sql = `CALL UpsertMember("${userId}", "${timezone}")`;
    connection.query(sql, function (error, results, fields) {
        if (error) {
            console.error(error);
        }
    });
}

async function getTimezone(userId) {
    let sql = `CALL GetMemberTimeZone("${userId}")`;
    return new Promise((resolve, reject) => {
        connection.query(sql, function (error, results, fields) {
            if (error) {
                console.error(error);
                reject(error);
            }
            let table = results[0];
            if (table.length <= 0) {
                resolve(undefined);
            } else {
                let timezone = table[0]['TimeZone'];
                resolve(timezone);
            }
        });
    })
}

async function getActiveTimezones(guildUsers) {
    let memberDiscordIds = guildUsers.join(',');
    let sql = `CALL GetDistinctTimeZonesByDiscordIds("${memberDiscordIds}")`;
    return new Promise((resolve, reject) => {
        connection.query(sql, function (error, results, fields) {
            if (error) {
                console.error(error);
                reject(error);
            }
            let timezones = results[0].map(result => result['TimeZone']);
            resolve(timezones);
        });
    })
}

module.exports = {
    setTimezone,
    getTimezone,
    getActiveTimezones
};
