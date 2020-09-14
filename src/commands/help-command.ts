import { DMChannel, Message, TextChannel } from 'discord.js';
import { UserData } from '../models/user-data';
import { MessageName } from '../services/language/message-name';
import { MessageSender } from '../services/message-sender';

export class HelpCommand {
    constructor(private msgSender: MessageSender) {}

    public async execute(
        msg: Message,
        channel: TextChannel | DMChannel,
        authorData: UserData
    ): Promise<void> {
        await this.msgSender.sendWithTitle(
            channel,
            authorData.LangCode,
            MessageName.helpMessage,
            MessageName.helpTitle
        );
    }
}
