import { DMChannel, MessageReaction, User } from 'discord.js';
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
import { StringUtils } from '../utils/string-utils';
import { UserUtils } from '../utils/user-utils';

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

    public async process(messageReaction: MessageReaction, user: User): Promise<void> {
        let reactedEmoji = messageReaction.emoji.name;
        if (reactedEmoji !== this.emoji) {
            return;
        }

        if (UserUtils.isBot(user)) {
            return;
        }

        if (messageReaction.message.partial) {
            try {
                await messageReaction.message.fetch();
            } catch (error) {
                this.logger.error(this.logs.retrievePartialReactionMessageError, error);
                return;
            }
        }

        let msg = messageReaction.message;
        let result = this.timeParser.parseTime(msg.content);
        if (
            !result ||
            this.timeParser.offsetIsCertain(result.start) ||
            !this.timeParser.hourIsCertain(result.start) ||
            this.timeParser.matchesBlacklist(result.text)
        ) {
            return;
        }

        // TODO: Dynamically get lang code based on server setting
        let langCode = LangCode.en;

        let dmChannel: DMChannel;
        try {
            dmChannel = user.dmChannel ?? (await user.createDM());
        } catch (error) {
            this.logger.error(this.logs.createDmChannelError, error);
            return;
        }

        let backupChannel = msg.channel;

        let server = msg.guild;
        if (server) {
            let serverData: ServerData;
            try {
                serverData = await this.serverRepo.getServerData(server.id);
            } catch (error) {
                this.msgSender.send(
                    dmChannel,
                    langCode,
                    MessageName.retrieveServerDataError,
                    undefined,
                    backupChannel
                );
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
            let userData = await this.userRepo.getUserData(user.id);
            userZone = userData.TimeZone;
            userFormat = userData.TimeFormat;
        } catch (error) {
            this.msgSender.send(
                dmChannel,
                langCode,
                MessageName.retrieveUserDataError,
                undefined,
                backupChannel
            );
            this.logger.error(this.logs.retrieveUserDataError, error);
            return;
        }

        if (!userZone) {
            this.msgSender.send(
                dmChannel,
                langCode,
                MessageName.noZoneSetSelf,
                undefined,
                backupChannel
            );
            return;
        }

        let authorZone: string;
        try {
            let authorData = await this.userRepo.getUserData(author.id);
            authorZone = authorData.TimeZone;
        } catch (error) {
            this.msgSender.send(
                dmChannel,
                langCode,
                MessageName.retrieveUserDataError,
                undefined,
                backupChannel
            );
            this.logger.error(this.logs.retrieveUserDataError, error);
            return;
        }

        if (!authorZone) {
            this.msgSender.send(
                dmChannel,
                langCode,
                MessageName.noZoneSetUser,
                [{ name: '{USER}', value: author.username }],
                backupChannel
            );
            return;
        }

        let moment = this.zoneService.convert(result.date(), authorZone, userZone);

        let timeFormat = this.timeFormatService.findTimeFormat(userFormat);
        let format = this.timeParser.dayIsCertain(result.start)
            ? `${timeFormat.dateFormat} ${timeFormat.timeFormat}`
            : timeFormat.timeFormat;

        let formattedTime = moment.format(format);
        let quote = StringUtils.formatQuote(result.text);

        this.msgSender.send(
            dmChannel,
            langCode,
            MessageName.convertedTime,
            [
                { name: '{AUTHOR}', value: author.username },
                { name: '{QUOTE}', value: quote },
                { name: '{AUTHOR_ZONE}', value: authorZone },
                { name: '{USER_ZONE}', value: userZone },
                { name: '{CONVERTED_TIME}', value: formattedTime },
            ],
            backupChannel
        );
    }
}
