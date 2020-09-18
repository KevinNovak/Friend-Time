import { DMChannel, Message, TextChannel } from 'discord.js';

import { MessageSender } from '../services';
import { MessageName } from '../services/language';
import { Command } from './command';

export class MapCommand implements Command {
    public name = 'map';
    public requireGuild = false;

    constructor(private msgSender: MessageSender) {}

    public async execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel
    ): Promise<void> {
        await this.msgSender.sendWithTitle(channel, MessageName.mapMessage, MessageName.mapTitle);
    }
}
