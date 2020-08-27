import { DiscordAPIError } from 'discord.js';
import { Response } from 'node-fetch';

import { Tags } from '../models/internal-language';

export class Logger {
    private shardTag: string;

    constructor(private tags: Tags) {}

    public info(message: string): void {
        let log = this.tags.info;
        if (this.shardTag) {
            log += ' ' + this.shardTag;
        }
        log += ' ' + message;
        console.log(log);
    }

    public warn(message: string): void {
        let log = this.tags.warn;
        if (this.shardTag) {
            log += ' ' + this.shardTag;
        }
        log += ' ' + message;
        console.warn(log);
    }

    public async error(message: string, error?: any): Promise<void> {
        // Log custom error message
        let log = this.tags.error;
        if (this.shardTag) {
            log += ' ' + this.shardTag;
        }
        log += ' ' + message;
        console.error(log);

        // Log error object if exists
        if (!error) {
            return;
        }

        switch (error.constructor) {
            case Response:
                let response = error as Response;
                let responseText: string;
                try {
                    responseText = await response.text();
                } catch {
                    // Ignore
                }
                console.error({
                    path: response.url,
                    statusCode: response.status,
                    statusName: response.statusText,
                    body: responseText,
                });
                break;
            case DiscordAPIError:
                let discordError = error as DiscordAPIError;
                console.error({
                    message: discordError.message,
                    code: discordError.code,
                    statusCode: discordError.httpStatus,
                    method: discordError.method,
                    path: discordError.path,
                    stack: discordError.stack,
                });
                break;
            default:
                console.error(error);
                break;
        }
    }

    public setShardId(shardId: number): void {
        if (shardId > -1) {
            this.shardTag = this.tags.shard.replace('{SHARD_ID}', shardId.toString());
        }
    }
}
