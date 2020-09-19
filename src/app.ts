import { ShardingManager } from 'discord.js';

import { Manager } from './manager';
import { ConfigSchema } from './models/config-models';
import { LogsSchema } from './models/logs';
import { HttpService, Logger } from './services';
import {
    BotsOnDiscordXyzSite,
    DiscordBotListComSite,
    DiscordBotsGgSite,
    TopGgSite,
} from './services/sites';
import { ShardUtils } from './utils';

let Config: ConfigSchema = require('../config/config.json');
let Debug = require('../config/debug.json');
let Logs: LogsSchema = require('../lang/logs.en.json');

async function start(): Promise<void> {
    Logger.info(Logs.appStarted);
    let httpService = new HttpService();

    // Bot sites
    let topGgSite = new TopGgSite(Config.botSites.topGg, httpService);
    let botsOnDiscordXyzSite = new BotsOnDiscordXyzSite(
        Config.botSites.botsOnDiscordXyz,
        httpService
    );
    let discordBotsGgSite = new DiscordBotsGgSite(Config.botSites.discordBotsGg, httpService);
    let discordBotListComSite = new DiscordBotListComSite(
        Config.botSites.discordBotListCom,
        httpService
    );

    // Sharding
    let totalShards = 0;
    try {
        totalShards = Debug.override.shardCount.enabled
            ? Debug.override.shardCount.value
            : await ShardUtils.getRecommendedShards(
                  Config.client.token,
                  Config.sharding.serversPerShard
              );
    } catch (error) {
        Logger.error(Logs.shardCountError, error);
        return;
    }

    let myShardIds = ShardUtils.getMyShardIds(
        totalShards,
        Config.sharding.machineId,
        Config.sharding.machineCount
    );

    if (myShardIds.length === 0) {
        Logger.warn(Logs.noShards);
        return;
    }

    let shardManager = new ShardingManager('dist/start.js', {
        token: Config.client.token,
        mode: Debug.override.shardMode.enabled ? Debug.override.shardMode.value : 'worker',
        respawn: true,
        totalShards,
        shardList: myShardIds,
    });

    let manager = new Manager(shardManager, [
        topGgSite,
        botsOnDiscordXyzSite,
        discordBotsGgSite,
        discordBotListComSite,
    ]);

    // Start
    await manager.start();
    setInterval(() => {
        manager.updateServerCount();
    }, Config.jobs.updateServerCount.interval * 1000);
}

start();
