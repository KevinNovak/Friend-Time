import mysql, { ConnectionConfig, Pool } from 'mysql';

import { SqlUtils } from '../../utils';

export class DataAccess {
    private pool: Pool;

    constructor(private dbConfig: ConnectionConfig) {
        this.reconnect();
    }

    public async executeProcedure(name: string, params: any[]): Promise<any> {
        let sql = SqlUtils.createProcedureSql(name, params);
        return new Promise((resolve, reject) => {
            this.pool.query(sql, (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(results);
            });
        });
    }

    private reconnect() {
        this.pool = mysql.createPool({
            ...this.dbConfig,
            typeCast: (field, next) => this.typeCast(field, next),
        });
    }

    private typeCast(field: any, next: any) {
        if (field.type === 'TINY' && field.length === 1) {
            return field.string() === '1'; // 1 = true, 0 = false
        } else {
            return next();
        }
    }
}
