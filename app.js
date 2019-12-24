const { ShardingManager, Util } = require("discord.js");
const _config = require("./config/config.json");
const _lang = require("./config/lang.json");

const TOKEN = _config.token;
const SERVERS_PER_SHARD = _config.sharding.serversPerShard;
const MACHINE_ID = _config.sharding.machineId;
const MACHINE_COUNT = _config.sharding.machineCount;

async function start() {
    console.log(_lang.log.events.shardManager.start);

    let totalShardCount = 0;
    try {
        totalShardCount = Math.ceil(
            await Util.fetchRecommendedShards(TOKEN, SERVERS_PER_SHARD)
        );
    } catch (error) {
        console.error(_lang.log.info.retrieveShardCountError);
        console.error(error);
        return;
    }

    let myShardIds = [];
    for (let shardId = 0; shardId < totalShardCount; shardId++) {
        if (shardId % MACHINE_COUNT == MACHINE_ID) {
            myShardIds.push(shardId);
        }
    }

    if (myShardIds.length == 0) {
        console.log(_lang.log.info.noShards);
        return;
    }

    let _manager = new ShardingManager("./bot.js", {
        token: TOKEN,
        mode: "worker",
        respawn: true,
        totalShards: totalShardCount,
        shardList: myShardIds
    });

    _manager.on("shardCreate", shard => {
        return console.log(
            _lang.log.events.shardManager.launch.replace("{SHARD_ID}", shard.id)
        );
    });

    _manager.spawn();
}

start();
