import { Message } from 'discord.js';
import { Trigger } from '.';
import { EventData } from '../models/internal-models';
import { Lang } from '../services';
import { MessageUtils } from '../utils';

export class OldPrefixTrigger implements Trigger {
    public requireGuild = false;

    public triggered(msg: Message): boolean {
        return msg.content.split(' ')?.[0].toLowerCase() === '-ft';
    }

    public async execute(msg: Message, data: EventData): Promise<void> {
        try {
            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed('validationEmbeds.oldPrefixUsed', data.lang())
            );
        } catch (error) {
            // Ignore
        }
    }
}