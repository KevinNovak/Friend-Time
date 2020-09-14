import { DMChannel, Message, TextChannel } from 'discord.js';

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
        channel: TextChannel | DMChannel
    ): Promise<void> {
        await this.userRepo.clearTimeZone(msg.author.id);

        await this.msgSender.send(channel, MessageName.clearSuccess);
        this.logger.info(
            this.logs.clearSuccess
                .replace('{USERNAME}', msg.author.username)
                .replace('{USER_ID}', msg.author.id)
        );
    }
}
