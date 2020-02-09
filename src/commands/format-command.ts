import { Message } from 'discord.js';
import { Logs } from '../models/internal-language';
import { ServerData } from '../models/server-data';
import { UserData } from '../models/user-data';
import { UserRepo } from '../services/database/user-repo';
import { CommandName } from '../services/language/command-name';
import { MessageName } from '../services/language/message-name';
import { Logger } from '../services/logger';
import { MessageSender } from '../services/message-sender';
import { TimeFormatService } from '../services/time-format-service';
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
        authorData: UserData,
        serverData?: ServerData
    ): Promise<void> {
        let author = msg.author;
        let channel = msg.channel;

        let formatInput = args.join(' ');
        if (!formatInput) {
            this.msgSender.send(channel, authorData.LangCode, MessageName.invalidTimeFormat);
            return;
        }

        let timeFormat = this.timeFormatService.findTimeFormat(formatInput);
        if (!timeFormat) {
            this.msgSender.send(channel, authorData.LangCode, MessageName.invalidTimeFormat);
            return;
        }

        try {
            await this.userRepo.setTimeFormat(author.id, timeFormat.name);
        } catch (error) {
            this.msgSender.send(channel, authorData.LangCode, MessageName.formatError);
            this.logger.error(this.logs.formatError, error);
            return;
        }

        this.msgSender.send(channel, authorData.LangCode, MessageName.formatSuccess, [
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
