import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import TypeORM from 'typeorm';
export const { createConnection } = TypeORM;
import type { Connection } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

let Config = require('../../config/config.json');

export class Database {
    public static async connect(): Promise<Connection> {
        return await createConnection({
            ...Config.database,
            entities: [
                path.join(dirname(fileURLToPath(import.meta.url)), './entities/**/*{.ts,.js}'),
            ],
            synchronize: true,
            logging: false,
            namingStrategy: new SnakeNamingStrategy(),
        });
    }
}
