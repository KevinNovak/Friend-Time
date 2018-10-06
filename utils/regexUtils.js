const timeRegex = /\b([1-9]|1[0-2])(:\d{2})?\s*(a|p|am|pm)\b/i;

function containsTime(msg) {
    return timeRegex.test(msg);
}

function matchTime(msg) {
    return timeRegex.exec(msg);
}

module.exports = {
    containsTime,
    matchTime
};
