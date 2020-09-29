import { DMChannel, Message, TextChannel } from 'discord.js';

import { LogsSchema } from '../models/logs';
import { UserRepo } from '../repos';
import { Logger, MessageSender, TimeFormatService } from '../services';
import { Command } from './command';

let Logs: LogsSchema = require('../../lang/logs.en.json');

export class FormatCommand implements Command {
    public name = 'format';
    public requireGuild = false;

    constructor(
        private msgSender: MessageSender,
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
            await this.msgSender.sendEmbed(channel, 'invalidTimeFormat');
            return;
        }

        let timeFormat = this.timeFormatService.findTimeFormat(formatInput);
        if (!timeFormat) {
            await this.msgSender.sendEmbed(channel, 'invalidTimeFormat');
            return;
        }

        await this.userRepo.setTimeFormat(msg.author.id, timeFormat.name);

        await this.msgSender.sendEmbed(channel, 'formatSuccess', { FORMAT: timeFormat.display });
        Logger.info(
            Logs.formatSuccess
                .replace('{USERNAME}', msg.author.username)
                .replace('{USER_ID}', msg.author.id)
                .replace('{FORMAT}', timeFormat.display)
        );
    }
}
