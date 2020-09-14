import { DMChannel, Message, TextChannel } from 'discord.js';

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
        channel: TextChannel | DMChannel
    ): Promise<void> {
        let formatInput = args.join(' ');
        if (!formatInput) {
            await this.msgSender.send(channel, MessageName.invalidTimeFormat);
            return;
        }

        let timeFormat = this.timeFormatService.findTimeFormat(formatInput);
        if (!timeFormat) {
            await this.msgSender.send(channel, MessageName.invalidTimeFormat);
            return;
        }

        await this.userRepo.setTimeFormat(msg.author.id, timeFormat.name);

        await this.msgSender.send(channel, MessageName.formatSuccess, [
            { name: '{FORMAT}', value: timeFormat.display },
        ]);
        this.logger.info(
            this.logs.formatSuccess
                .replace('{USERNAME}', msg.author.username)
                .replace('{USER_ID}', msg.author.id)
                .replace('{FORMAT}', timeFormat.display)
        );
    }
}
