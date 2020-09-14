import { DMChannel, Message, TextChannel } from 'discord.js';
import { ServerData } from '../models/server-data';
import { UserData } from '../models/user-data';
import { MessageSender } from '../services';
import { CommandName, MessageName } from '../services/language';
import { Command } from './command';

export class MapCommand implements Command {
    public name = CommandName.map;

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
            MessageName.mapMessage,
            MessageName.mapTitle
        );
    }
}
