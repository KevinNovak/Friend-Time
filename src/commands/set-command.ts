import { DMChannel, Message, TextChannel } from 'discord.js';

import { Logs } from '../models/internal-language';
import { UserRepo } from '../repos';
import { Logger, MessageSender, ZoneService } from '../services';
import { CommandName, MessageName } from '../services/language';
import { Command } from './command';

export class SetCommand implements Command {
    public name = CommandName.set;

    constructor(
        private msgSender: MessageSender,
        private logger: Logger,
        private logs: Logs,
        private zoneService: ZoneService,
        private userRepo: UserRepo
    ) {}

    public async execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel
    ): Promise<void> {
        let zoneInput = args.join(' ');
        if (!zoneInput) {
            await this.msgSender.send(channel, MessageName.setProvideZone);
            return;
        }

        let zone = this.zoneService.findZone(zoneInput);
        if (!zone) {
            await this.msgSender.send(channel, MessageName.zoneNotFound);
            return;
        }

        await this.userRepo.setTimeZone(msg.author.id, zone);

        await this.msgSender.send(channel, MessageName.setSuccess, [
            { name: '{ZONE}', value: zone },
        ]);
        this.logger.info(
            this.logs.setSuccess
                .replace('{USERNAME}', msg.author.username)
                .replace('{USER_ID}', msg.author.id)
                .replace('{ZONE}', zone)
        );
    }
}
