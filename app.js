const { ShardingManager } = require('discord.js');
const config = require('./config/config.json');

const manager = new ShardingManager('./bot.js', { token: config.token });

manager.spawn();
manager.on('launch', shard => {
    return console.log(`Launched shard ${shard.id}`);
});