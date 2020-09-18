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
let Logs: LogsSchema = require('../lang/logs.en.json');

async function start(): Promise<void> {
    // Dependency Injection
    let httpService = new HttpService();
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

    Logger.info(Logs.appStarted);

    let totalShards = 0;
    try {
        totalShards = await ShardUtils.getRecommendedShards(
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
        mode: 'worker',
        respawn: true,
        totalShards,
        shardList: myShardIds,
    });

    let manager = new Manager(Config.sharding, shardManager, [
        topGgSite,
        botsOnDiscordXyzSite,
        discordBotsGgSite,
        discordBotListComSite,
    ]);
    await manager.start();
    setInterval(() => {
        manager.updateServerCount();
    }, Config.jobs.updateServerCount.interval * 1000);
}

start();
