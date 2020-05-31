import { DMChannel, Message, TextChannel } from 'discord.js';
import { Command } from '../commands/command';
import { HelpCommand } from '../commands/help-command';
import { ReminderCommand } from '../commands/reminder-command';
import { Logs } from '../models/internal-language';
import { ServerData } from '../models/server-data';
import { UserData } from '../models/user-data';
import { ServerRepo } from '../services/database/server-repo';
import { UserRepo } from '../services/database/user-repo';
import { LangCode } from '../services/language/lang-code';
import { LanguageService } from '../services/language/lang-service';
import { MessageName } from '../services/language/message-name';
import { Logger } from '../services/logger';
import { MessageSender } from '../services/message-sender';
import { TimeFormatService } from '../services/time-format-service';
import { TimeParser } from '../services/time-parser';
import { ZoneService } from '../services/zone-service';
import { MessageUtils } from '../utils/message-utils';
import { ServerUtils } from '../utils/server-utils';
import { StringUtils } from '../utils/string-utils';

export class MessageHandler {
    // Move to config?
    private MAX_MESSAGE_LENGTH = 2000;

    constructor(
        private prefix: string,
        private emoji: string,
        private helpCommand: HelpCommand,
        private reminderCommand: ReminderCommand,
        private commands: Command[],
        private serverRepo: ServerRepo,
        private userRepo: UserRepo,
        private msgSender: MessageSender,
        private timeParser: TimeParser,
        private zoneService: ZoneService,
        private timeFormatService: TimeFormatService,
        private langService: LanguageService,
        private logger: Logger,
        private logs: Logs
    ) {}

    public async process(msg: Message): Promise<void> {
        if (
            msg.partial ||
            MessageUtils.sentByBot(msg) ||
            !MessageUtils.permToReply(msg) ||
            !MessageUtils.permToReact(msg)
        ) {
            return;
        }

        let author = msg.author;
        let channel = msg.channel;
        let server = msg.guild;

        if (!(channel instanceof TextChannel || channel instanceof DMChannel)) {
            return;
        }

        // Detect if message contains time and react
        let result = this.timeParser.parseTime(msg.content);
        if (this.timeParser.shouldRespond(result)) {
            let authorData: UserData;
            try {
                authorData = await this.userRepo.getUserData(author.id);
            } catch (error) {
                this.msgSender.send(channel, undefined, MessageName.retrieveUserDataError);
                this.logger.error(this.logs.retrieveUserDataError, error);
                return;
            }

            if (!authorData.TimeZone) {
                this.processReminder(msg, channel, authorData);
                return;
            }

            if (!server) {
                try {
                    msg.react(this.emoji);
                } catch (error) {
                    this.logger.error(this.logs.reactError, error);
                }
                return;
            }

            let serverData: ServerData;
            try {
                serverData = await this.serverRepo.getServerData(server.id);
            } catch (error) {
                this.msgSender.send(
                    channel,
                    authorData.LangCode,
                    MessageName.retrieveServerDataError
                );
                this.logger.error(this.logs.retrieveServerDataError, error);
                return;
            }

            if (serverData.Mode !== 'List') {
                try {
                    msg.react(this.emoji);
                } catch (error) {
                    this.logger.error(this.logs.reactError, error);
                }
                return;
            }

            // TODO: Formats in server config
            // TODO: Move to other classes
            let discordIds = ServerUtils.getMemberDiscordIds(server);
            let timeZones: string[];
            try {
                timeZones = await this.userRepo.getDistinctTimeZones(discordIds);
            } catch (error) {
                this.msgSender.send(
                    channel,
                    authorData.LangCode,
                    MessageName.retrieveDistinctTimeZonesError
                );
                this.logger.error(this.logs.retrieveDistinctTimeZonesError, error);
                return;
            }

            // TODO: Better way to find time format, consolidate
            let timeFormat = this.timeFormatService.findTimeFormat(serverData.TimeFormat);
            let format = this.timeParser.dayIsCertain(result.start)
                ? `${timeFormat.dateFormat} ${timeFormat.timeFormat}`
                : timeFormat.timeFormat;

            let timeZoneData = timeZones
                .map(name => ({
                    name,
                    // TODO: More efficient way so we don't convert twice
                    time: this.zoneService
                        .convert(result, authorData.TimeZone, name)
                        .format(format),
                    offset: parseInt(
                        this.zoneService.convert(result, authorData.TimeZone, name).format('ZZ')
                    ),
                }))
                .sort(this.compareTimeZones);

            let message = `> ${StringUtils.formatQuote(result.text)}\n`;
            for (let data of timeZoneData) {
                // TODO: Message
                let line = '';
                if (
                    data.name === authorData.TimeZone &&
                    !this.timeParser.offsetIsCertain(result.start)
                ) {
                    line = '__***{TIMEZONE}***__: {TIME}'
                        .replace('{TIMEZONE}', data.name)
                        .replace('{TIME}', data.time);
                } else {
                    line = '**{TIMEZONE}**: {TIME}'
                        .replace('{TIMEZONE}', data.name)
                        .replace('{TIME}', data.time);
                }
                line += '\n';
                if (message.length + line.length > this.MAX_MESSAGE_LENGTH) {
                    // Use message sender
                    msg.channel.send(message);
                    message = '';
                }
                message += line;
            }
            if (message.length > 1) {
                // Use message sender
                msg.channel.send(message);
            }
        }

        // Stop if message doesn't start with prefix or mentions me
        let startsWithMyMention = MessageUtils.startsWithMyMention(msg);
        if (!MessageUtils.startsWithPrefix(msg, this.prefix) && !startsWithMyMention) {
            return;
        }

        let authorData: UserData;
        try {
            authorData = await this.userRepo.getUserData(author.id);
        } catch (error) {
            this.msgSender.send(channel, undefined, MessageName.retrieveUserDataError);
            this.logger.error(this.logs.retrieveUserDataError, error);
            return;
        }

        if (startsWithMyMention) {
            this.helpCommand.execute(msg, channel, authorData);
            return;
        }

        let args = MessageUtils.extractArgs(msg);

        // If message is just the prefix, run help
        if (args.length < 2) {
            this.helpCommand.execute(msg, channel, authorData);
            return;
        }

        // Find the appropriate command
        let userCommand = args[1];
        let command = this.resolveCommand(userCommand, authorData.LangCode);

        // If no command found, run help
        if (!command) {
            this.helpCommand.execute(msg, channel, authorData);
            return;
        }

        let serverData: ServerData;
        if (server) {
            try {
                serverData = await this.serverRepo.getServerData(server.id);
            } catch (error) {
                this.msgSender.send(
                    channel,
                    authorData.LangCode,
                    MessageName.retrieveServerDataError
                );
                this.logger.error(this.logs.retrieveServerDataError, error);
                return;
            }
        }

        // Run the command
        command.execute(msg, args.slice(2), channel, authorData, serverData);
    }

    private async processReminder(
        msg: Message,
        channel: TextChannel | DMChannel,
        authorData: UserData
    ): Promise<void> {
        let server = msg.guild;

        let serverData: ServerData;
        if (server) {
            try {
                serverData = await this.serverRepo.getServerData(server.id);
            } catch (error) {
                this.msgSender.send(
                    channel,
                    authorData.LangCode,
                    MessageName.retrieveServerDataError
                );
                this.logger.error(this.logs.retrieveServerDataError, error);
                return;
            }
        }

        this.reminderCommand.execute(msg, channel, authorData, serverData);
    }

    // TODO: More efficient way to resolve commands
    private resolveCommand(userCommand: string, langCode: LangCode): Command {
        let langCommands = this.langService.getCommands(langCode);
        for (let commandKey in langCommands) {
            if (langCommands[commandKey] === userCommand) {
                return this.commands.find(command => command.name === commandKey);
            }
        }
    }

    // TODO: Move to another class
    private compareTimeZones(a: any, b: any): number {
        if (a.offset > b.offset) {
            return 1;
        }
        if (a.offset < b.offset) {
            return -1;
        }
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    }
}
