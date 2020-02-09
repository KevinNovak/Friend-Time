import { Message } from 'discord.js';
import { ServerData } from '../models/server-data';
import { UserData } from '../models/user-data';
import { CommandName } from '../services/language/command-name';

export interface Command {
    name: CommandName;
    execute(
        msg: Message,
        args: string[],
        authorData: UserData,
        serverData?: ServerData
    ): Promise<void>;
}
