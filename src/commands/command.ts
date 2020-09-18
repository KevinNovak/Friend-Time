import { DMChannel, Message, TextChannel } from 'discord.js';

import { GuildData, UserData } from '../models/database-models';

export interface Command {
    name: string;
    requireGuild: boolean;
    execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel,
        authorData?: UserData,
        guildData?: GuildData
    ): Promise<void>;
}
