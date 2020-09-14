import { DMChannel, Message, TextChannel } from 'discord.js';

import { MessageSender } from '../services';
import { MessageName } from '../services/language';

export class HelpCommand {
    constructor(private msgSender: MessageSender) {}

    public async execute(msg: Message, channel: TextChannel | DMChannel): Promise<void> {
        await this.msgSender.sendWithTitle(channel, MessageName.helpMessage, MessageName.helpTitle);
    }
}
