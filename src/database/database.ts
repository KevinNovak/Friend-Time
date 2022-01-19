import { createRequire } from 'node:module';
import { Connection, createConnection } from 'typeorm';

import { GuildBotData, GuildData, GuildListItemData, UserData } from './entities/index.js';
import { SnakeNamingStrategy } from './snake-naming-strategy.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');

export class Database {
    public static async connect(): Promise<Connection> {
        return await createConnection({
            ...Config.database,
            entities: [GuildBotData, GuildListItemData, GuildData, UserData],
            synchronize: true,
            logging: false,
            namingStrategy: new SnakeNamingStrategy(),
        });
    }
}
