import { DMChannel, Message, TextChannel } from 'discord.js';

import { MessageSender } from '.';
import { GuildData } from '../models/database-models';
import { MessageName } from './language';

export class ReminderService {
    constructor(private msgSender: MessageSender) {}

    public async remind(
        msg: Message,
        channel: TextChannel | DMChannel,
        guildData?: GuildData
    ): Promise<void> {
        let shouldNotify =
            (channel instanceof TextChannel && guildData?.Notify) || channel instanceof DMChannel;
        if (!shouldNotify) {
            return;
        }

        await this.msgSender.send(channel, MessageName.noZoneSetReminder, [
            { name: '{AUTHOR_ID}', value: msg.author.id },
        ]);
    }
}
