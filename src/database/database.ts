import { createRequire } from 'node:module';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { GuildBotData, GuildData, GuildListItemData, UserData } from './entities/index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');

export class Database {
    public static async connect(): Promise<DataSource> {
        let dataSource = new DataSource({
            ...Config.database,
            entities: [GuildBotData, GuildListItemData, GuildData, UserData],
            synchronize: true,
            logging: false,
            namingStrategy: new SnakeNamingStrategy(),
        });
        return await dataSource.initialize();
    }
}
