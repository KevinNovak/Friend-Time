import { DiscordAPIError, DMChannel, MessageReaction, User } from 'discord.js';

import { LogsSchema } from '../models/logs';
import { GuildRepo, UserRepo } from '../repos';
import { Logger, MessageSender, TimeFormatService, TimeParser, ZoneService } from '../services';
import { StringUtils } from '../utils';
import { EventHandler } from './event-handler';

let Logs: LogsSchema = require('../../lang/logs.en.json');

export class ReactionHandler implements EventHandler {
    constructor(
        private emoji: string,
        private msgSender: MessageSender,
        private timeParser: TimeParser,
        private zoneService: ZoneService,
        private timeFormatService: TimeFormatService,
        private guildRepo: GuildRepo,
        private userRepo: UserRepo
    ) {}

    public async process(messageReaction: MessageReaction, reactor: User): Promise<void> {
        let reactedEmoji = messageReaction.emoji.name;
        if (reactedEmoji !== this.emoji) {
            return;
        }

        // Don't respond to bots
        if (reactor.bot) {
            return;
        }

        // Fill partial structures
        try {
            if (messageReaction.partial) {
                messageReaction = await messageReaction.fetch();
            }
            if (messageReaction.message.partial) {
                messageReaction.message = await messageReaction.message.fetch();
            }
        } catch (error) {
            // Error code 10008: "Unknown Message" (message was deleted)
            // Error code 50001: "Missing Access"
            if (error instanceof DiscordAPIError && [10008, 50001].includes(error.code)) {
                return;
            } else {
                Logger.error(Logs.retrievePartialReactionMessageError, error);
                return;
            }
        }

        let msg = messageReaction.message;

        let result = this.timeParser.parseTime(msg.content);
        if (!this.timeParser.shouldConvert(result)) {
            return;
        }

        let dmChannel: DMChannel = reactor.dmChannel ?? (await reactor.createDM());

        if (msg.guild) {
            let guildData = await this.guildRepo.getGuildData(msg.guild.id);
            if (guildData.Mode !== 'React') {
                return;
            }
        }

        let userData = await this.userRepo.getUserData(reactor.id);
        if (!userData?.TimeZone) {
            await this.msgSender.sendEmbed(dmChannel, 'noZoneSetSelf');
            return;
        }

        let authorData = await this.userRepo.getUserData(msg.author.id);
        if (!authorData?.TimeZone) {
            await this.msgSender.sendEmbed(dmChannel, 'noZoneSetUser', { USER_ID: msg.author.id });
            return;
        }

        let moment = this.zoneService.convert(result, authorData.TimeZone, userData.TimeZone);

        let timeFormat = this.timeFormatService.getTimeFormat(userData?.TimeFormat);
        let format = this.timeParser.dayIsCertain(result.start)
            ? `${timeFormat.dateFormat} ${timeFormat.timeFormat}`
            : timeFormat.timeFormat;

        let formattedTime = moment.format(format);
        let quote = StringUtils.formatQuote(result.text);

        await this.msgSender.sendEmbed(dmChannel, 'convertedTime', {
            AUTHOR_ID: msg.author.id,
            QUOTE: quote,
            AUTHOR_ZONE: authorData.TimeZone,
            USER_ZONE: userData.TimeZone,
            CONVERTED_TIME: formattedTime,
        });
    }
}
