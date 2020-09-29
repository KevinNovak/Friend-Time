import { DMChannel, Message, TextChannel } from 'discord.js';

import { MessageSender } from '../services';
import { Command } from './command';

export class InviteCommand implements Command {
    public name = 'invite';
    public requireGuild = false;

    constructor(private msgSender: MessageSender) {}

    public async execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel
    ): Promise<void> {
        await this.msgSender.sendEmbed(channel, 'invite');
    }
}
