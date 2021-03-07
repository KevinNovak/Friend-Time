import path from 'path';
import { Connection, createConnection } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

let Config = require('../../config/config.json');

export class Database {
    public static async connect(): Promise<Connection> {
        return await createConnection({
            ...Config.database,
            entities: [path.join(__dirname, './entities/**/*{.ts,.js}')],
            synchronize: true,
            logging: false,
            namingStrategy: new SnakeNamingStrategy(),
        });
    }
}
