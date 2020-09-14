import { Guild } from 'discord.js';

import { Logs } from '../models/internal-language';
import { Logger } from '../services';
import { EventHandler } from './event-handler';

export class GuildLeaveHandler implements EventHandler {
    constructor(private logs: Logs) {}

    public async process(guild: Guild): Promise<void> {
        Logger.info(
            this.logs.guildJoined
                .replace('{GUILD_NAME}', guild.name)
                .replace('{GUILD_ID}', guild.id)
        );
    }
}
