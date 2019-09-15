const { ShardingManager } = require('discord.js');
const config = require('./config/config.json');
const lang = require('./config/lang.json');

const manager = new ShardingManager('./bot.js', { token: config.token });

manager.spawn();
manager.on('launch', shard => {
    return console.log(lang.log.launchedShard.replace('{SHARD_ID}', shard.id));
});
