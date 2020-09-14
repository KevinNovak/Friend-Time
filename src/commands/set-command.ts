import { DMChannel, Message, TextChannel } from 'discord.js';
import { Logs } from '../models/internal-language';
import { ServerData } from '../models/server-data';
import { UserData } from '../models/user-data';
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
        channel: TextChannel | DMChannel,
        authorData: UserData,
        serverData?: ServerData
    ): Promise<void> {
        let author = msg.author;

        let zoneInput = args.join(' ');
        if (!zoneInput) {
            await this.msgSender.send(channel, authorData.LangCode, MessageName.setProvideZone);
            return;
        }

        let zone = this.zoneService.findZone(zoneInput);
        if (!zone) {
            await this.msgSender.send(channel, authorData.LangCode, MessageName.zoneNotFound);
            return;
        }

        try {
            await this.userRepo.setTimeZone(author.id, zone);
        } catch (error) {
            await this.msgSender.send(channel, authorData.LangCode, MessageName.setError);
            this.logger.error(this.logs.setError, error);
            return;
        }

        await this.msgSender.send(channel, authorData.LangCode, MessageName.setSuccess, [
            { name: '{ZONE}', value: zone },
        ]);
        this.logger.info(
            this.logs.setSuccess
                .replace('{USERNAME}', author.username)
                .replace('{USER_ID}', author.id)
                .replace('{ZONE}', zone)
        );
    }
}
