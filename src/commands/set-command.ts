import { DMChannel, Message, TextChannel } from 'discord.js';

import { LogsSchema } from '../models/logs';
import { UserRepo } from '../repos';
import { Logger, MessageSender, ZoneService } from '../services';
import { MessageName } from '../services/language';
import { Command } from './command';

let Logs: LogsSchema = require('../../lang/logs.en.json');

export class SetCommand implements Command {
    public name = 'set';
    public requireGuild = false;

    constructor(
        private msgSender: MessageSender,
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
        Logger.info(
            Logs.setSuccess
                .replace('{USERNAME}', msg.author.username)
                .replace('{USER_ID}', msg.author.id)
                .replace('{ZONE}', zone)
        );
    }
}
