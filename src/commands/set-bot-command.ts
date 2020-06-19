import { DMChannel, Message, TextChannel } from 'discord.js';
import { Logs } from '../models/internal-language';
import { ServerData } from '../models/server-data';
import { UserData } from '../models/user-data';
import { UserRepo } from '../services/database/user-repo';
import { CommandName } from '../services/language/command-name';
import { MessageName } from '../services/language/message-name';
import { Logger } from '../services/logger';
import { MessageSender } from '../services/message-sender';
import { ZoneService } from '../services/zone-service';
import { UserUtils } from '../utils/user-utils';
import { Command } from './command';

export class SetBotCommand implements Command {
    name: CommandName;

    constructor(
        private msgSender: MessageSender,
        private logger: Logger,
        private logs: Logs,
        private zoneService: ZoneService,
        private userRepo: UserRepo
    ) {}

    public async execute(msg: Message, args: string[], channel: TextChannel | DMChannel, authorData: UserData, serverData?: ServerData): Promise<void> {
        if (args.length < 2) {
            return;
        }
        if (!UserUtils.isAdmin(msg.author, channel as TextChannel)) {
            return;
        }
        let timeZone = args[0];
        let bot = msg.mentions.users.first();
        if (!UserUtils.isBot(bot)) {
            await this.msgSender.send(channel, authorData.LangCode, MessageName.setError);
            return;
        }
        try {
            await this.userRepo.setTimeZone(bot.id, timeZone);
            await this.msgSender.send(channel, authorData.LangCode, MessageName.setSuccess);
            return;
        } catch (e) {
            await this.msgSender.send(channel, authorData.LangCode, MessageName.setError);
            return;
        }
    }
}
