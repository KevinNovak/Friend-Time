import { DMChannel, Message, TextChannel } from 'discord.js';

import { MessageSender } from '../services';
import { CommandName, MessageName } from '../services/language';
import { Command } from './command';

export class InfoCommand implements Command {
    public name = CommandName.info;
    public requireGuild = false;

    constructor(private msgSender: MessageSender) {}

    public async execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel
    ): Promise<void> {
        await this.msgSender.sendWithTitle(channel, MessageName.infoMessage, MessageName.infoTitle);
    }
}
