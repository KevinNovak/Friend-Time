import { ShardingManager } from 'discord.js';
import { Manager } from './manager';
import { Config } from './models/config-models';
import { InternalLanguage } from './models/internal-language';
import { HttpService, Logger } from './services';
import {
    BotsOnDiscordXyzSite,
    DiscordBotListComSite,
    DiscordBotsGgSite,
    TopGgSite,
} from './services/sites';
import { ShardUtils } from './utils';

let config: Config = require('../config/config.json');
let internalLang: InternalLanguage = require('../lang/internal.en.json');

async function start(): Promise<void> {
    // Dependency Injection
    let logger = new Logger(internalLang.tags);
    let httpService = new HttpService();
    let topGgSite = new TopGgSite(config.botSites.topGg, httpService);
    let botsOnDiscordXyzSite = new BotsOnDiscordXyzSite(
        config.botSites.botsOnDiscordXyz,
        httpService
    );
    let discordBotsGgSite = new DiscordBotsGgSite(config.botSites.discordBotsGg, httpService);
    let discordBotListComSite = new DiscordBotListComSite(
        config.botSites.discordBotListCom,
        httpService
    );

    logger.info(`${internalLang.tags.manager} ${internalLang.logs.appStarted}`);

    let totalShards = 0;
    try {
        totalShards = await ShardUtils.getRecommendedShards(
            config.client.token,
            config.sharding.serversPerShard
        );
    } catch (error) {
        logger.error(`${internalLang.tags.manager} ${internalLang.logs.shardCountError}`, error);
        return;
    }

    let myShardIds = ShardUtils.getMyShardIds(
        totalShards,
        config.sharding.machineId,
        config.sharding.machineCount
    );

    if (myShardIds.length === 0) {
        logger.warn(`${internalLang.tags.manager} ${internalLang.logs.noShards}`);
        return;
    }

    let shardManager = new ShardingManager('dist/start.js', {
        token: config.client.token,
        mode: 'worker',
        respawn: true,
        totalShards,
        shardList: myShardIds,
    });

    let manager = new Manager(
        config.sharding,
        shardManager,
        [topGgSite, botsOnDiscordXyzSite, discordBotsGgSite, discordBotListComSite],
        logger,
        internalLang.tags.manager,
        internalLang.logs
    );
    await manager.start();
    setInterval(() => {
        manager.updateServerCount();
    }, config.jobs.updateServerCount.interval * 1000);
}

start();
