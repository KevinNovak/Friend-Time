import { DMChannel, Message, TextChannel } from 'discord.js';

import { MessageSender } from '../services';
import { CommandName, MessageName } from '../services/language';
import { Command } from './command';

export class InviteCommand implements Command {
    public name = CommandName.invite;

    constructor(private msgSender: MessageSender) {}

    public async execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel
    ): Promise<void> {
        await this.msgSender.sendWithTitle(
            channel,
            MessageName.inviteMessage,
            MessageName.inviteTitle
        );
    }
}
