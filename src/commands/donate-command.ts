import { DMChannel, Message, TextChannel } from 'discord.js';

import { MessageSender } from '../services';
import { MessageName } from '../services/language';
import { Command } from './command';

export class DonateCommand implements Command {
    public name = 'donate';
    public requireGuild = false;

    constructor(private msgSender: MessageSender) {}

    public async execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel
    ): Promise<void> {
        await this.msgSender.sendEmbed(channel, 'donate');
    }
}
