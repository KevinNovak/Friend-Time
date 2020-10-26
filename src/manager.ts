import { Shard, ShardingManager } from 'discord.js';

import { Job } from './jobs';
import { ConfigSchema } from './models/config-models';
import { LogsSchema } from './models/logs';
import { Logger } from './services';

let Config: ConfigSchema = require('../config/config.json');
let Logs: LogsSchema = require('../lang/logs.en.json');

export class Manager {
    constructor(private shardManager: ShardingManager, private jobs: Job[]) {}

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
        this.startJobs();
    }

    private registerListeners(): void {
        this.shardManager.on('shardCreate', shard => this.onShardCreate(shard));
    }

    private startJobs(): void {
        for (let job of this.jobs) {
            job.start();
        }
    }

    private onShardCreate(shard: Shard): void {
        Logger.info(Logs.launchedShard.replace('{SHARD_ID}', shard.id.toString()));
    }
}
