import { UserData } from '../models/database-models';
import { DataAccess } from '../services/database/data-access';
import { Procedure } from '../services/database/procedure';
import { SqlUtils } from '../utils';

export class UserRepo {
    constructor(private dataAccess: DataAccess) {}

    public async getUserData(discordId: string): Promise<UserData> {
        let results = await this.dataAccess.executeProcedure(Procedure.User_Get, [discordId]);

        let row = SqlUtils.getRow(results, 0, 0);
        if (!row) {
            return;
        }

        return new UserData(row);
    }

    public async getDistinctTimeZones(discordIds: string[]): Promise<string[]> {
        let discordIdsString = discordIds.join(',');
        let results = await this.dataAccess.executeProcedure(Procedure.User_GetDistinctTimeZones, [
            discordIdsString,
        ]);

        let table = SqlUtils.getTable(results, 0);
        if (!table) {
            return;
        }

        return table.map(row => row.TimeZone);
    }

    public async setTimeZone(discordId: string, timeZone: string): Promise<void> {
        await this.dataAccess.executeProcedure(Procedure.User_SetTimeZone, [discordId, timeZone]);
    }

    public async clearTimeZone(discordId: string): Promise<void> {
        await this.dataAccess.executeProcedure(Procedure.User_SetTimeZone, [discordId, null]);
    }

    public async setTimeFormat(discordId: string, timeFormat: string): Promise<void> {
        await this.dataAccess.executeProcedure(Procedure.User_SetTimeFormat, [
            discordId,
            timeFormat,
        ]);
    }
}
