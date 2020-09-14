import mysql from 'mysql';

export abstract class SqlUtils {
    public static createProcedureSql(name: string, params: any[]): string {
        let sql = `CALL ${name}(${new Array(params.length).fill('?').join(',')});`;
        params = params.map(this.typeCast);
        return mysql.format(sql, params);
    }

    private static typeCast(param: any): any {
        // Cast booleans to numbers
        if (typeof param === 'boolean') {
            return +param;
        }
        return param;
    }

    public static getTable(results: any, index: number): any {
        return results[index];
    }

    public static getRow(results: any, tableIndex: number, rowIndex: number): any {
        return results[tableIndex]?.[rowIndex];
    }
}
