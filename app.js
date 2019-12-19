const { ShardingManager } = require("discord.js");
const _config = require("./config/config.json");
const _lang = require("./config/lang.json");

let _manager = new ShardingManager("./bot.js", { token: _config.token });

_manager.on("launch", shard => {
    return console.log(
        _lang.log.events.shardManager.launch.replace("{SHARD_ID}", shard.id)
    );
});

console.log(_lang.log.events.shardManager.start);
_manager.spawn();
