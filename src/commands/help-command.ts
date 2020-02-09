import { Message } from 'discord.js';
import { UserData } from '../models/user-data';
import { MessageName } from '../services/language/message-name';
import { MessageSender } from '../services/message-sender';

export class HelpCommand {
    constructor(private msgSender: MessageSender) {}

    public async execute(msg: Message, authorData: UserData): Promise<void> {
        let channel = msg.channel;

        this.msgSender.sendWithTitle(
            channel,
            authorData.LangCode,
            MessageName.helpMessage,
            MessageName.helpTitle
        );
    }
}
