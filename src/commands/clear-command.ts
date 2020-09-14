import { DMChannel, Message, TextChannel } from 'discord.js';
import { ServerData, UserData } from '../models/database-models';
import { Logs } from '../models/internal-language';
import { UserRepo } from '../repos';
import { Logger, MessageSender } from '../services';
import { CommandName, MessageName } from '../services/language';
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
            await this.msgSender.send(channel, authorData.LangCode, MessageName.clearError);
            this.logger.error(this.logs.clearError, error);
            return;
        }

        await this.msgSender.send(channel, authorData.LangCode, MessageName.clearSuccess);
        this.logger.info(
            this.logs.clearSuccess
                .replace('{USERNAME}', author.username)
                .replace('{USER_ID}', author.id)
        );
    }
}
