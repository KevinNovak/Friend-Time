import { DMChannel, Message, TextChannel } from 'discord.js';
import { Command } from '.';

import { MessageSender } from '../services';
import { CommandName, MessageName } from '../services/language';

export class HelpCommand implements Command {
    public name = CommandName.help;
    public requireGuild = false;

    constructor(private msgSender: MessageSender) {}

    public async execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel
    ): Promise<void> {
        await this.msgSender.sendWithTitle(channel, MessageName.helpMessage, MessageName.helpTitle);
    }
}
