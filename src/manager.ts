import { Shard, ShardingManager } from 'discord.js';

import { ConfigSchema } from './models/config-models';
import { LogsSchema } from './models/logs';
import { Logger } from './services';
import { BotSite } from './services/sites';
import { ShardUtils } from './utils';

let Config: ConfigSchema = require('../config/config.json');
let Logs: LogsSchema = require('../lang/logs.en.json');

export class Manager {
    constructor(private shardManager: ShardingManager, private botSites: BotSite[]) {}

    public async start(): Promise<void> {
        this.registerListeners();
        try {
            await this.shardManager.spawn(
                this.shardManager.totalShards,
                Config.sharding.spawnDelay * 1000,
                Config.sharding.spawnTimeout * 1000
            );
        } catch (error) {
            Logger.error(Logs.spawnShardError, error);
            return;
        }
        this.updateServerCount();
    }

    public async updateServerCount(): Promise<void> {
        let serverCount: number;
        try {
            serverCount = await ShardUtils.retrieveServerCount(this.shardManager);
        } catch (error) {
            Logger.error(Logs.retrieveServerCountError, error);
            return;
        }
        try {
            await this.shardManager.broadcastEval(`
            this.user.setPresence({
                activity: {
                    name: 'time to ${serverCount.toLocaleString()} servers',
                    type: "STREAMING",
                    url: "https://www.twitch.tv/monstercat"
                }
            });
        `);
        } catch (error) {
            Logger.error(Logs.broadcastServerCountError, error);
        }

        Logger.info(
            Logs.updatedServerCount.replace('{SERVER_COUNT}', serverCount.toLocaleString())
        );

        for (let botSite of this.botSites) {
            if (!botSite.enabled) {
                continue;
            }

            try {
                await botSite.updateServerCount(serverCount);
            } catch (error) {
                Logger.error(
                    Logs.updateServerCountSiteError.replace('{BOT_SITE}', botSite.name),
                    error
                );
                continue;
            }

            Logger.info(Logs.updateServerCountSite.replace('{BOT_SITE}', botSite.name));
        }
    }
    private registerListeners(): void {
        this.shardManager.on('shardCreate', shard => this.onShardCreate(shard));
    }

    private onShardCreate(shard: Shard): void {
        Logger.info(Logs.launchedShard.replace('{SHARD_ID}', shard.id.toString()));
    }
}
