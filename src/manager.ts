import { ShardingManager } from 'discord.js';

import { ShardingConfig } from './models/config-models';
import { Logs } from './models/internal-language';
import { Logger } from './services';
import { BotSite } from './services/sites';

export class Manager {
    constructor(
        private shardingConfig: ShardingConfig,
        private shardManager: ShardingManager,
        private botSites: BotSite[],
        private logs: Logs
    ) {}

    public async start(): Promise<void> {
        this.registerListeners();
        try {
            await this.shardManager.spawn(
                this.shardManager.totalShards,
                this.shardingConfig.spawnDelay * 1000,
                this.shardingConfig.spawnTimeout * 1000
            );
        } catch (error) {
            Logger.error(this.logs.spawnShardError, error);
            return;
        }
        this.updateServerCount();
    }

    public async updateServerCount(): Promise<void> {
        let serverCount: number;
        try {
            serverCount = await this.retrieveServerCount();
        } catch (error) {
            Logger.error(this.logs.retrieveServerCountError, error);
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
            Logger.error(this.logs.broadcastServerCountError, error);
        }

        Logger.info(
            this.logs.updatedServerCount.replace('{SERVER_COUNT}', serverCount.toLocaleString())
        );

        for (let botSite of this.botSites) {
            if (!botSite.enabled) {
                continue;
            }

            try {
                await botSite.updateServerCount(serverCount);
            } catch (error) {
                Logger.error(
                    this.logs.updateServerCountSiteError.replace('{BOT_SITE}', botSite.name),
                    error
                );
                continue;
            }

            Logger.info(this.logs.updateServerCountSite.replace('{BOT_SITE}', botSite.name));
        }
    }

    private async retrieveServerCount(): Promise<number> {
        let shardSizes: number[];
        try {
            shardSizes = await this.shardManager.fetchClientValues('guilds.cache.size');
        } catch (error) {
            throw error;
        }
        return shardSizes.reduce((prev, val) => prev + val, 0);
    }

    private registerListeners(): void {
        this.shardManager.on('shardCreate', shard => this.onShardCreate(shard));
    }

    private onShardCreate(shard: import('discord.js').Shard): void {
        Logger.info(this.logs.launchedShard.replace('{SHARD_ID}', shard.id.toString()));
    }
}
