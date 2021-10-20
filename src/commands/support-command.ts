import { Message } from 'discord.js';

import { EventData } from '../models/internal-models';
import { Lang } from '../services';
import { MessageUtils } from '../utils';
import { Command } from './command';

export class SupportCommand implements Command {
    public name = Lang.getCom('commands.support');
    public requireDev = false;
    public requireGuild = false;
    public requirePerms = [];

    public async execute(msg: Message, args: string[], data: EventData): Promise<void> {
        await MessageUtils.send(msg.channel, Lang.getEmbed('displayEmbeds.support', data.lang()));
    }
}
