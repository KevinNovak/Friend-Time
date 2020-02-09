export abstract class SqlUtils {
    public static createProcedureSql(name: string, params: any[]): string {
        let joinedParams = params.map(this.mapTypeToParam).join(', ');
        return `CALL ${name}(${joinedParams});`;
    }

    public static getFirstResult(results: any): any {
        return results[0];
    }

    public static getFirstResultFirstRow(results: any): any {
        let firstResult = this.getFirstResult(results);
        if (!firstResult) {
            return;
        }

        return firstResult[0];
    }

    private static mapTypeToParam(input: any): string {
        switch (typeof input) {
            case 'string':
                return `"${input}"`;
            case 'undefined':
                return 'NULL';
            case 'object':
                if (!input) {
                    return 'NULL';
                }
            default:
                return input.toString();
        }
    }
}
