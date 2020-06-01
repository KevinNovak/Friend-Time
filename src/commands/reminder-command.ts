import { DMChannel, Message, TextChannel } from 'discord.js';
import { ServerData } from '../models/server-data';
import { UserData } from '../models/user-data';
import { MessageName } from '../services/language/message-name';
import { MessageSender } from '../services/message-sender';
import { ServerUtils } from '../utils/server-utils';

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

        let fromTextChannel = ServerUtils.isTextChannel(channel);
        let fromDirectChannel = ServerUtils.isDirectChannel(channel);

        let shouldNotify = (fromTextChannel && serverData?.Notify) || fromDirectChannel;
        if (!shouldNotify) {
            return;
        }

        this.msgSender.send(channel, authorData.LangCode, MessageName.noZoneSetReminder, [
            { name: '{AUTHOR_ID}', value: author.id },
        ]);
    }
}
