const TIME_REGEX = /\b([1-9]|1[0-2])(:\d{2})?\s*(a|p|am|pm)\b/i;

function containsTime(msg) {
    return TIME_REGEX.test(msg);
}

function matchTime(msg) {
    return TIME_REGEX.exec(msg);
}

module.exports = {
    containsTime,
    matchTime
};
