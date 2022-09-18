import { Message } from 'discord.js';

import { EventData } from '../models/internal-models.js';
import { Lang } from '../services/index.js';
import { MessageUtils } from '../utils/index.js';
import { Trigger } from './index.js';

export class OldPrefixTrigger implements Trigger {
    public requireGuild = false;

    public triggered(msg: Message): boolean {
        return ['ft', '-ft', '/ft'].includes(msg.content.split(' ')?.[0].toLowerCase());
    }

    public async execute(msg: Message, data: EventData): Promise<void> {
        try {
            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed('validationEmbeds.oldPrefixUsed', data.lang)
            );
        } catch (error) {
            // Ignore
        }
    }
}
