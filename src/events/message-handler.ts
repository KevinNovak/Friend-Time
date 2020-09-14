import { DMChannel, Message, TextChannel } from 'discord.js';
import { Command, HelpCommand, ReminderCommand } from '../commands';
import { Logs } from '../models/internal-language';
import { ServerData } from '../models/server-data';
import { UserData } from '../models/user-data';
import { ServerRepo, UserRepo } from '../repos';
import { Logger, MessageSender, TimeFormatService, TimeParser, ZoneService } from '../services';
import { LangCode } from '../services/language/lang-code';
import { LanguageService } from '../services/language/lang-service';
import { MessageName } from '../services/language/message-name';
import { PermissionUtils, ServerUtils, StringUtils } from '../utils';

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
        // Check if the message is a partial
        if (msg.partial) {
            return;
        }

        let channel = msg.channel;

        // Only handle messages from text or DM channels
        if (!(channel instanceof TextChannel || channel instanceof DMChannel)) {
            return;
        }

        // Don't respond to bots
        if (msg.author.bot) {
            return;
        }

        // Check if I have permission to send a message
        if (channel instanceof TextChannel && !PermissionUtils.canSendEmbed(channel)) {
            // No permission to send message
            if (PermissionUtils.canSend(channel)) {
                let message = `I don't have all permissions required to send messages here!\n\nPlease allow me to **Read Messages**, **Send Messages**, and **Embed Links** in this channel.`;
                await channel.send(message);
            }
            return;
        }

        // Detect if message contains time and react
        let result = this.timeParser.parseTime(msg.content);
        if (this.timeParser.shouldRespond(result)) {
            // Check if I have permission to react
            if (channel instanceof TextChannel && !PermissionUtils.canReact(channel)) {
                return;
            }

            let authorData: UserData;
            try {
                authorData = await this.userRepo.getUserData(msg.author.id);
            } catch (error) {
                await this.msgSender.send(channel, undefined, MessageName.retrieveUserDataError);
                this.logger.error(this.logs.retrieveUserDataError, error);
                return;
            }

            if (!authorData.TimeZone) {
                this.processReminder(msg, channel, authorData);
                return;
            }

            if (!msg.guild) {
                try {
                    await msg.react(this.emoji);
                } catch (error) {
                    this.logger.error(this.logs.reactError, error);
                }
                return;
            }

            let serverData: ServerData;
            try {
                serverData = await this.serverRepo.getServerData(msg.guild.id);
            } catch (error) {
                await this.msgSender.send(
                    channel,
                    authorData.LangCode,
                    MessageName.retrieveServerDataError
                );
                this.logger.error(this.logs.retrieveServerDataError, error);
                return;
            }

            if (serverData.Mode !== 'List') {
                try {
                    await msg.react(this.emoji);
                } catch (error) {
                    this.logger.error(this.logs.reactError, error);
                }
                return;
            }

            // TODO: Formats in server config
            // TODO: Move to other classes
            let discordIds = ServerUtils.getMemberDiscordIds(msg.guild);
            let timeZones: string[];
            try {
                timeZones = await this.userRepo.getDistinctTimeZones(discordIds);
            } catch (error) {
                await this.msgSender.send(
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

        // Check if first argument is prefix
        let args = msg.content.split(' ');
        if (args[0].toLowerCase() !== this.prefix) {
            return;
        }

        let authorData: UserData;
        try {
            authorData = await this.userRepo.getUserData(msg.author.id);
        } catch (error) {
            await this.msgSender.send(channel, undefined, MessageName.retrieveUserDataError);
            this.logger.error(this.logs.retrieveUserDataError, error);
            return;
        }

        // If only a prefix, run the help command
        if (args.length === 1) {
            await this.helpCommand.execute(msg, channel, authorData);
            return;
        }

        // Find the appropriate command
        let userCommand = args[1];
        let command = this.findCommand(userCommand, authorData.LangCode);

        // If no command found, run help
        if (!command) {
            await this.helpCommand.execute(msg, channel, authorData);
            return;
        }

        let serverData: ServerData;
        if (msg.guild) {
            try {
                serverData = await this.serverRepo.getServerData(msg.guild.id);
            } catch (error) {
                await this.msgSender.send(
                    channel,
                    authorData.LangCode,
                    MessageName.retrieveServerDataError
                );
                this.logger.error(this.logs.retrieveServerDataError, error);
                return;
            }
        }

        // Run the command
        await command.execute(msg, args.slice(2), channel, authorData, serverData);
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
                await this.msgSender.send(
                    channel,
                    authorData.LangCode,
                    MessageName.retrieveServerDataError
                );
                this.logger.error(this.logs.retrieveServerDataError, error);
                return;
            }
        }

        await this.reminderCommand.execute(msg, channel, authorData, serverData);
    }

    // TODO: More efficient way to resolve commands
    private findCommand(userCommand: string, langCode: LangCode): Command {
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
