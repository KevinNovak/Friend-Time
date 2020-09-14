import { DMChannel, Message, TextChannel } from 'discord.js';
import { ServerData, UserData } from '../models/database-models';
import { Logs } from '../models/internal-language';
import { UserRepo } from '../repos';
import { Logger, MessageSender, TimeFormatService } from '../services';
import { CommandName, MessageName } from '../services/language';
import { Command } from './command';

export class FormatCommand implements Command {
    public name = CommandName.format;

    constructor(
        private msgSender: MessageSender,
        private logger: Logger,
        private logs: Logs,
        private userRepo: UserRepo,
        private timeFormatService: TimeFormatService
    ) {}

    public async execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel,
        authorData: UserData,
        serverData?: ServerData
    ): Promise<void> {
        let author = msg.author;

        let formatInput = args.join(' ');
        if (!formatInput) {
            await this.msgSender.send(channel, authorData.LangCode, MessageName.invalidTimeFormat);
            return;
        }

        let timeFormat = this.timeFormatService.findTimeFormat(formatInput);
        if (!timeFormat) {
            await this.msgSender.send(channel, authorData.LangCode, MessageName.invalidTimeFormat);
            return;
        }

        try {
            await this.userRepo.setTimeFormat(author.id, timeFormat.name);
        } catch (error) {
            await this.msgSender.send(channel, authorData.LangCode, MessageName.formatError);
            this.logger.error(this.logs.formatError, error);
            return;
        }

        await this.msgSender.send(channel, authorData.LangCode, MessageName.formatSuccess, [
            { name: '{FORMAT}', value: timeFormat.display },
        ]);
        this.logger.info(
            this.logs.formatSuccess
                .replace('{USERNAME}', author.username)
                .replace('{USER_ID}', author.id)
                .replace('{FORMAT}', timeFormat.display)
        );
    }
}
