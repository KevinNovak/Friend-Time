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

    public error(message: string, error?: any): void {
        let log = this.tags.error;
        if (this.shardTag) {
            log += ' ' + this.shardTag;
        }
        log += ' ' + message;
        console.error(log);
        if (error) {
            if (error instanceof Error) {
                console.error(error.stack);
            } else {
                console.error(error);
            }
        }
    }

    public setShardId(shardId: number): void {
        if (shardId > -1) {
            this.shardTag = this.tags.shard.replace('{SHARD_ID}', shardId.toString());
        }
    }
}
