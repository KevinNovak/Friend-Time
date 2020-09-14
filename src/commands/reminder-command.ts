import { DMChannel, Message, TextChannel } from 'discord.js';

import { GuildData } from '../models/database-models';
import { MessageSender } from '../services';
import { MessageName } from '../services/language';

export class ReminderCommand {
    constructor(private msgSender: MessageSender) {}

    public async execute(
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
