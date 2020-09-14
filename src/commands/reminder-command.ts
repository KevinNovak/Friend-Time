import { DMChannel, Message, TextChannel } from 'discord.js';

import { ServerData, UserData } from '../models/database-models';
import { MessageSender } from '../services';
import { MessageName } from '../services/language';

export class ReminderCommand {
    constructor(private msgSender: MessageSender) {}

    public async execute(
        msg: Message,
        channel: TextChannel | DMChannel,
        authorData: UserData,
        serverData?: ServerData
    ): Promise<void> {
        let author = msg.author;

        if (authorData.TimeZone) {
            return;
        }

        let shouldNotify =
            (channel instanceof TextChannel && serverData?.Notify) || channel instanceof DMChannel;
        if (!shouldNotify) {
            return;
        }

        await this.msgSender.send(channel, authorData.LangCode, MessageName.noZoneSetReminder, [
            { name: '{AUTHOR_ID}', value: author.id },
        ]);
    }
}
