import { Message } from 'discord.js';
import { Logs } from '../models/internal-language';
import { ServerData } from '../models/server-data';
import { UserData } from '../models/user-data';
import { UserRepo } from '../services/database/user-repo';
import { CommandName } from '../services/language/command-name';
import { MessageName } from '../services/language/message-name';
import { Logger } from '../services/logger';
import { MessageSender } from '../services/message-sender';
import { ZoneService } from '../services/zone-service';
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
        authorData: UserData,
        serverData?: ServerData
    ): Promise<void> {
        let author = msg.author;
        let channel = msg.channel;

        let zoneInput = args.join(' ');
        if (!zoneInput) {
            this.msgSender.send(channel, authorData.LangCode, MessageName.setProvideZone);
            return;
        }

        let zone = this.zoneService.findZone(zoneInput);
        if (!zone) {
            this.msgSender.send(channel, authorData.LangCode, MessageName.zoneNotFound);
            return;
        }

        try {
            await this.userRepo.setTimeZone(author.id, zone);
        } catch (error) {
            this.msgSender.send(channel, authorData.LangCode, MessageName.setError);
            this.logger.error(this.logs.setError, error);
            return;
        }

        this.msgSender.send(channel, authorData.LangCode, MessageName.setSuccess, [
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
