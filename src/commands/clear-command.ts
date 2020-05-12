import { DMChannel, Message, TextChannel } from 'discord.js';
import { Logs } from '../models/internal-language';
import { ServerData } from '../models/server-data';
import { UserData } from '../models/user-data';
import { UserRepo } from '../services/database/user-repo';
import { CommandName } from '../services/language/command-name';
import { MessageName } from '../services/language/message-name';
import { Logger } from '../services/logger';
import { MessageSender } from '../services/message-sender';
import { Command } from './command';

export class ClearCommand implements Command {
    public name = CommandName.clear;

    constructor(
        private msgSender: MessageSender,
        private logger: Logger,
        private logs: Logs,
        private userRepo: UserRepo
    ) {}

    public async execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel,
        authorData: UserData,
        serverData?: ServerData
    ): Promise<void> {
        let author = msg.author;

        try {
            await this.userRepo.clearTimeZone(author.id);
        } catch (error) {
            this.msgSender.send(channel, authorData.LangCode, MessageName.clearError);
            this.logger.error(this.logs.clearError, error);
            return;
        }

        this.msgSender.send(channel, authorData.LangCode, MessageName.clearSuccess);
        this.logger.info(
            this.logs.clearSuccess
                .replace('{USERNAME}', author.username)
                .replace('{USER_ID}', author.id)
        );
    }
}
