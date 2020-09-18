import { Guild } from 'discord.js';

import { Logs } from '../models/logs';
import { Logger } from '../services';
import { EventHandler } from './event-handler';

let Logs: Logs = require('../../lang/logs.en.json');

export class GuildJoinHandler implements EventHandler {
    public async process(guild: Guild): Promise<void> {
        Logger.info(
            Logs.guildJoined.replace('{GUILD_NAME}', guild.name).replace('{GUILD_ID}', guild.id)
        );
    }
}
