const { ShardingManager, Util } = require("discord.js");
const _config = require("./config/config.json");
const _lang = require("./config/lang.json");

const TOKEN = _config.token;
const MACHINE_ID = _config.sharding.machineId;
const MACHINE_COUNT = _config.sharding.machineCount;

async function start() {
    console.log(_lang.log.events.shardManager.start);

    const totalShardCount = await Util.fetchRecommendedShards(TOKEN);

    let myShardIds = [];
    for (let shardId = 0; shardId < totalShardCount; shardId++) {
        if (shardId % MACHINE_COUNT == MACHINE_ID) {
            myShardIds.push(shardId);
        }
    }

    let _manager = new ShardingManager("./bot.js", {
        token: TOKEN,
        totalShards: totalShardCount
    });

    _manager.on("launch", shard => {
        return console.log(
            _lang.log.events.shardManager.launch.replace("{SHARD_ID}", shard.id)
        );
    });

    for (let shardId of myShardIds) {
        _manager.createShard(shardId);
    }
}

start();
