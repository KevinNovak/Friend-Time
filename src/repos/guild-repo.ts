import { GuildData } from '../models/database-models';
import { DataAccess } from '../services/database/data-access';
import { Procedure } from '../services/database/procedure';
import { SqlUtils } from '../utils';

export class GuildRepo {
    constructor(private dataAccess: DataAccess) {}

    public async getGuildData(discordId: string): Promise<GuildData> {
        let results = await this.dataAccess.executeProcedure(Procedure.Server_Get, [discordId]);

        let row = SqlUtils.getRow(results, 0, 0);
        if (!row) {
            return;
        }

        return new GuildData(row);
    }

    public async setMode(discordId: string, mode: string): Promise<void> {
        await this.dataAccess.executeProcedure(Procedure.Server_SetMode, [discordId, mode]);
    }

    public async setTimeFormat(discordId: string, timeFormat: string): Promise<void> {
        await this.dataAccess.executeProcedure(Procedure.Server_SetTimeFormat, [
            discordId,
            timeFormat,
        ]);
    }

    public async setNotify(discordId: string, notify: boolean): Promise<void> {
        await this.dataAccess.executeProcedure(Procedure.Server_SetNotify, [discordId, notify]);
    }
}
