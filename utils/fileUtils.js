const fs = require('fs');
const path = require('path');
const dirname = require('path').dirname;
const mkdirp = require('mkdirp');

function getFullPath(shortPath) {
    return path.join(__dirname, shortPath);
}

function createIfNotExists(filePath, data) {
    var folder = dirname(filePath);
    mkdirp.sync(folder);
    try {
        fs.writeFileSync(filePath, data, { flag: 'wx' });
    } catch (error) {
        // File exists, this is fine
        return;
    }
}

module.exports = {
    getFullPath,
    createIfNotExists
};
