import { DMChannel, Message, TextChannel } from 'discord.js';

import { Command, HelpCommand, ReminderCommand } from '../commands';
import { GuildData } from '../models/database-models';
import { GuildRepo, UserRepo } from '../repos';
import { MessageSender, TimeFormatService, TimeParser, ZoneService } from '../services';
import { LanguageService, MessageName } from '../services/language';
import { GuildUtils, MessageUtils, PermissionUtils, StringUtils } from '../utils';
import { EventHandler } from './event-handler';

export class MessageHandler implements EventHandler {
    // Move to config?
    private MAX_MESSAGE_LENGTH = 2000;

    constructor(
        private prefix: string,
        private emoji: string,
        private helpCommand: HelpCommand,
        private reminderCommand: ReminderCommand,
        private commands: Command[],
        private guildRepo: GuildRepo,
        private userRepo: UserRepo,
        private msgSender: MessageSender,
        private timeParser: TimeParser,
        private zoneService: ZoneService,
        private timeFormatService: TimeFormatService,
        private langService: LanguageService
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

        let args = msg.content.split(' ');
        let startsWithPrefix = args[0].toLowerCase() === this.prefix;

        let result = this.timeParser.parseTime(msg.content);
        let shouldConvert = this.timeParser.shouldConvert(result);

        // Return if I shouldn't handle this message
        if (!(startsWithPrefix || shouldConvert)) {
            return;
        }

        // Check if I have permission to send a message
        if (channel instanceof TextChannel && !PermissionUtils.canSendEmbed(channel)) {
            if (PermissionUtils.canSend(channel)) {
                let message = this.langService.getMessage(MessageName.noPermToSendEmbed);
                await MessageUtils.send(channel, message);
            }
            return;
        }

        // Gather user data
        let userData = await this.userRepo.getUserData(msg.author.id);

        // Gather guild data
        let guildData: GuildData;
        if (msg.guild) {
            guildData = await this.guildRepo.getGuildData(msg.guild.id);
        }

        if (shouldConvert) {
            if (!userData?.TimeZone) {
                await this.reminderCommand.execute(msg, channel, guildData);
                return;
            }

            if (!msg.guild) {
                await MessageUtils.react(msg, this.emoji);
                return;
            }

            if (guildData.Mode !== 'List') {
                // Check if I have permission to react
                if (channel instanceof TextChannel && !PermissionUtils.canReact(channel)) {
                    return;
                }

                await MessageUtils.react(msg, this.emoji);
                return;
            }

            // TODO: Formats in server config
            // TODO: Move to other classes
            let discordIds = GuildUtils.getMemberDiscordIds(msg.guild);
            let timeZones = await this.userRepo.getDistinctTimeZones(discordIds);

            // TODO: Better way to find time format, consolidate
            let timeFormat = this.timeFormatService.getTimeFormat(guildData.TimeFormat);
            let format = this.timeParser.dayIsCertain(result.start)
                ? `${timeFormat.dateFormat} ${timeFormat.timeFormat}`
                : timeFormat.timeFormat;

            let timeZoneData = timeZones
                .map(name => {
                    let convertedTime = this.zoneService.convert(result, userData.TimeZone, name);
                    return {
                        name,
                        time: convertedTime.format(format),
                        offset: parseInt(convertedTime.format('ZZ')),
                    };
                })
                .sort(this.compareTimeZones);

            let message = `> ${StringUtils.formatQuote(result.text)}\n`;
            for (let data of timeZoneData) {
                // TODO: Message
                let line = '';
                if (
                    data.name === userData.TimeZone &&
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
                    await msg.channel.send(message);
                    message = '';
                }
                message += line;
            }

            if (message.length > 1) {
                // Use message sender
                await msg.channel.send(message);
            }

            return;
        }

        // If only a prefix, run the help command
        if (args.length === 1) {
            await this.helpCommand.execute(msg, channel);
            return;
        }

        // Find the appropriate command
        let userCommand = args[1];
        let command = this.findCommand(userCommand);

        // If no command found, run help
        if (!command) {
            await this.helpCommand.execute(msg, channel);
            return;
        }

        if (command.requireGuild && !(channel instanceof TextChannel)) {
            await this.msgSender.send(channel, MessageName.serverOnly);
            return;
        }

        // Run the command
        await command.execute(msg, args.slice(2), channel, userData, guildData);
    }

    // TODO: More efficient way to resolve commands
    private findCommand(userCommand: string): Command {
        let langCommands = this.langService.getCommands();
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
