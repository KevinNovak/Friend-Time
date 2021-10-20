import { Message, PermissionResolvable } from 'discord.js';
import { EventData } from '../models/internal-models';

export interface Command {
    name: string;
    requireDev: boolean;
    requireGuild: boolean;
    requirePerms: PermissionResolvable[];
    execute(msg: Message, args: string[], data: EventData): Promise<void>;
}
