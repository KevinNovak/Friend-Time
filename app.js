const { ShardingManager, Util } = require("discord.js");
const _config = require("./config/config.json");
const _lang = require("./config/lang.json");

const TOKEN = _config.token;
const LOAD_PERCENTAGE = _config.performance.loadPercentage;

async function start() {
    const recommendedShards = await Util.fetchRecommendedShards(TOKEN);
    const shardCount = Math.ceil(recommendedShards * LOAD_PERCENTAGE);

    let _manager = new ShardingManager("./bot.js", {
        token: TOKEN,
        totalShards: shardCount
    });

    _manager.on("launch", shard => {
        return console.log(
            _lang.log.events.shardManager.launch.replace("{SHARD_ID}", shard.id)
        );
    });

    console.log(_lang.log.events.shardManager.start);
    _manager.spawn();
}

start();
