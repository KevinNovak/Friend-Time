import { DMChannel, Message, TextChannel } from 'discord.js';

import { GuildData, UserData } from '../models/database-models';
import { CommandName } from '../services/language';

export interface Command {
    name: CommandName;
    execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel,
        authorData?: UserData,
        guildData?: GuildData
    ): Promise<void>;
}
