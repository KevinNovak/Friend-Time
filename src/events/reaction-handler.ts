import { DiscordAPIError, DMChannel, MessageReaction, TextChannel, User } from 'discord.js';
import { Logs } from '../models/internal-language';
import { ServerData } from '../models/server-data';
import { ServerRepo } from '../services/database/server-repo';
import { UserRepo } from '../services/database/user-repo';
import { LangCode } from '../services/language/lang-code';
import { MessageName } from '../services/language/message-name';
import { Logger } from '../services/logger';
import { MessageSender } from '../services/message-sender';
import { TimeFormatService } from '../services/time-format-service';
import { TimeParser } from '../services/time-parser';
import { ZoneService } from '../services/zone-service';
import { PermissionUtils } from '../utils/permission-utils';
import { StringUtils } from '../utils/string-utils';

export class ReactionHandler {
    constructor(
        private emoji: string,
        private msgSender: MessageSender,
        private timeParser: TimeParser,
        private zoneService: ZoneService,
        private timeFormatService: TimeFormatService,
        private serverRepo: ServerRepo,
        private userRepo: UserRepo,
        private logger: Logger,
        private logs: Logs
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
            // Error code 50001: "Missing Access"
            if (error instanceof DiscordAPIError && error.code === 50001) {
                return;
            } else {
                this.logger.error(this.logs.retrievePartialReactionMessageError, error);
                return;
            }
        }

        let msg = messageReaction.message;
        let channel = msg.channel;

        // Only handle messages from text or DM channels
        if (!(channel instanceof TextChannel || channel instanceof DMChannel)) {
            return;
        }

        // Check if I have permission to send a message
        if (channel instanceof TextChannel && !PermissionUtils.canSendEmbed(channel)) {
            // No permission to send message
            return;
        }

        let result = this.timeParser.parseTime(msg.content);
        if (!this.timeParser.shouldRespond(result)) {
            return;
        }

        // TODO: Dynamically get lang code based on server setting
        let langCode = LangCode.en;

        let dmChannel: DMChannel;
        try {
            dmChannel = reactor.dmChannel ?? (await reactor.createDM());
        } catch (error) {
            this.logger.error(this.logs.createDmChannelError, error);
            return;
        }

        let server = msg.guild;
        if (server) {
            let serverData: ServerData;
            try {
                serverData = await this.serverRepo.getServerData(server.id);
            } catch (error) {
                this.msgSender.send(dmChannel, langCode, MessageName.retrieveServerDataError);
                this.logger.error(this.logs.retrieveServerDataError, error);
                return;
            }

            if (serverData.Mode !== 'React') {
                return;
            }
        }

        let author = msg.author;
        let userZone: string;
        let userFormat: string;
        try {
            let userData = await this.userRepo.getUserData(reactor.id);
            userZone = userData.TimeZone;
            userFormat = userData.TimeFormat;
        } catch (error) {
            this.msgSender.send(dmChannel, langCode, MessageName.retrieveUserDataError);
            this.logger.error(this.logs.retrieveUserDataError, error);
            return;
        }

        if (!userZone) {
            this.msgSender.send(dmChannel, langCode, MessageName.noZoneSetSelf);
            return;
        }

        let authorZone: string;
        try {
            let authorData = await this.userRepo.getUserData(author.id);
            authorZone = authorData.TimeZone;
        } catch (error) {
            this.msgSender.send(dmChannel, langCode, MessageName.retrieveUserDataError);
            this.logger.error(this.logs.retrieveUserDataError, error);
            return;
        }

        if (!authorZone) {
            this.msgSender.send(dmChannel, langCode, MessageName.noZoneSetUser, [
                { name: '{USER_ID}', value: author.id },
            ]);
            return;
        }

        let moment = this.zoneService.convert(result, authorZone, userZone);

        let timeFormat = this.timeFormatService.findTimeFormat(userFormat);
        let format = this.timeParser.dayIsCertain(result.start)
            ? `${timeFormat.dateFormat} ${timeFormat.timeFormat}`
            : timeFormat.timeFormat;

        let formattedTime = moment.format(format);
        let quote = StringUtils.formatQuote(result.text);

        this.msgSender.send(dmChannel, langCode, MessageName.convertedTime, [
            { name: '{AUTHOR_ID}', value: author.id },
            { name: '{QUOTE}', value: quote },
            { name: '{AUTHOR_ZONE}', value: authorZone },
            { name: '{USER_ZONE}', value: userZone },
            { name: '{CONVERTED_TIME}', value: formattedTime },
        ]);
    }
}
