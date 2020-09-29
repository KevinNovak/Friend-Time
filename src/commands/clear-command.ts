import { DMChannel, Message, TextChannel } from 'discord.js';

import { LogsSchema } from '../models/logs';
import { UserRepo } from '../repos';
import { Logger, MessageSender } from '../services';
import { Command } from './command';

let Logs: LogsSchema = require('../../lang/logs.en.json');

export class ClearCommand implements Command {
    public name = 'clear';
    public requireGuild = false;

    constructor(private msgSender: MessageSender, private userRepo: UserRepo) {}

    public async execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel
    ): Promise<void> {
        await this.userRepo.clearTimeZone(msg.author.id);

        await this.msgSender.sendEmbed(channel, 'clearSuccess');
        Logger.info(
            Logs.clearSuccess
                .replace('{USERNAME}', msg.author.username)
                .replace('{USER_ID}', msg.author.id)
        );
    }
}
