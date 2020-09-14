import { DMChannel, Message, TextChannel } from 'discord.js';
import { ServerData } from '../models/server-data';
import { UserData } from '../models/user-data';
import { MessageSender } from '../services';
import { CommandName } from '../services/language/command-name';
import { MessageName } from '../services/language/message-name';
import { Command } from './command';

export class SupportCommand implements Command {
    public name = CommandName.support;

    constructor(private msgSender: MessageSender) {}

    public async execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel,
        authorData: UserData,
        serverData?: ServerData
    ): Promise<void> {
        await this.msgSender.sendWithTitle(
            channel,
            authorData.LangCode,
            MessageName.supportMessage,
            MessageName.supportTitle
        );
    }
}
