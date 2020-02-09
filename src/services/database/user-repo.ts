import { UserData } from '../../models/user-data';
import { SqlUtils } from '../../utils/sql-utils';
import { DataAccess } from './data-access';
import { Procedure } from './procedure';

export class UserRepo {
    constructor(private dataAccess: DataAccess) {}

    public async getUserData(discordId: string): Promise<UserData> {
        let results = await this.dataAccess
            .executeProcedure(Procedure.User_GetRow, [discordId])
            .catch(error => {
                throw error;
            });

        let userData = SqlUtils.getFirstResultFirstRow(results);
        if (!userData) {
            return;
        }

        return userData;
    }

    public async getDistinctTimeZones(discordIds: string[]): Promise<string[]> {
        let discordIdsString = discordIds.join(',');
        let results = await this.dataAccess
            .executeProcedure(Procedure.User_GetDistinctTimeZones, [discordIdsString])
            .catch(error => {
                throw error;
            });

        let result = SqlUtils.getFirstResult(results);
        if (!result) {
            return;
        }

        return result.map(row => row.TimeZone);
    }

    public async setTimeZone(discordId: string, timeZone: string): Promise<void> {
        await this.dataAccess
            .executeProcedure(Procedure.User_SetTimeZone, [discordId, timeZone])
            .catch(error => {
                throw error;
            });
    }

    public async clearTimeZone(discordId: string): Promise<void> {
        await this.dataAccess
            .executeProcedure(Procedure.User_SetTimeZone, [discordId, undefined])
            .catch(error => {
                throw error;
            });
    }

    public async setTimeFormat(discordId: string, timeFormat: string): Promise<void> {
        await this.dataAccess
            .executeProcedure(Procedure.User_SetTimeFormat, [discordId, timeFormat])
            .catch(error => {
                throw error;
            });
    }
}
