import { DMChannel, Message, TextChannel } from 'discord.js';

import { Command } from '.';
import { MessageSender } from '../services';

export class HelpCommand implements Command {
    public name = 'help';
    public requireGuild = false;

    constructor(private msgSender: MessageSender) {}

    public async execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel
    ): Promise<void> {
        await this.msgSender.sendEmbed(channel, 'help');
    }
}
