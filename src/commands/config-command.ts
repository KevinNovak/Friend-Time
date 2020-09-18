import { DMChannel, Guild, Message, TextChannel } from 'discord.js';

import { GuildRepo } from '../repos';
import { MessageSender } from '../services';
import { CommandName, LanguageService, MessageName } from '../services/language';
import {
    FormatOption,
    ModeOption,
    NotifyOption,
    ServerConfigName,
} from '../services/language/server-config';
import { PermissionUtils } from '../utils';
import { Command } from './command';

// TODO: This whole class needs refactored with the config options
export class ConfigCommand implements Command {
    public name = CommandName.config;
    public requireGuild = true;

    constructor(
        private msgSender: MessageSender,
        private guildRepo: GuildRepo,
        private langService: LanguageService
    ) {}

    public async execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel
    ): Promise<void> {
        if (args.length === 0) {
            await this.msgSender.sendWithTitle(
                channel,
                MessageName.configMessage,
                MessageName.configTitle
            );
            return;
        }

        if (!PermissionUtils.isAdmin(msg.author, channel as TextChannel)) {
            await this.msgSender.send(channel, MessageName.notAdmin);
            return;
        }

        let subCommand = args[0].toLowerCase();
        let modeConfigName = this.langService.getConfigName(ServerConfigName.mode);
        let formatConfigName = this.langService.getConfigName(ServerConfigName.format);
        let notifyConfigName = this.langService.getConfigName(ServerConfigName.notify);

        if (![modeConfigName, formatConfigName, notifyConfigName].includes(subCommand)) {
            await this.msgSender.send(channel, MessageName.configNotFound);
            return;
        }

        if (subCommand === modeConfigName) {
            this.processConfigMode(channel, msg.guild, args.slice(1));
            return;
        }

        if (subCommand === formatConfigName) {
            this.processConfigFormat(channel, msg.guild, args.slice(1));
            return;
        }

        if (subCommand === notifyConfigName) {
            this.processConfigNotify(channel, msg.guild, args.slice(1));
            return;
        }
    }

    // TODO: Extract out
    private async processConfigNotify(
        channel: TextChannel | DMChannel,
        guild: Guild,
        args: string[]
    ): Promise<void> {
        if (args.length === 0) {
            await this.msgSender.send(channel, MessageName.configNotifyInvalidValue);
            return;
        }

        let onOption = this.langService.getConfigOptionName(
            ServerConfigName.notify,
            NotifyOption.on
        );
        let offOption = this.langService.getConfigOptionName(
            ServerConfigName.notify,
            NotifyOption.off
        );

        let notifyInput = args[0].toLowerCase();
        if (![onOption, offOption].includes(notifyInput)) {
            await this.msgSender.send(channel, MessageName.configNotifyInvalidValue);
            return;
        }

        // TODO: Better way to resolve options
        let option = true;
        if (notifyInput === offOption) {
            option = false;
        }

        await this.guildRepo.setNotify(guild.id, option);

        await this.msgSender.send(channel, MessageName.configNotifySuccess, [
            {
                name: '{NOTIFY}',
                value: notifyInput,
            },
        ]);
    }

    // TODO: Extract out
    private async processConfigFormat(
        channel: TextChannel | DMChannel,
        guild: Guild,
        args: string[]
    ): Promise<void> {
        if (args.length === 0) {
            await this.msgSender.send(channel, MessageName.configFormatInvalidValue);
            return;
        }

        let twelveOption = this.langService.getConfigOptionName(
            ServerConfigName.format,
            FormatOption.twelve
        );
        let twentyFourOption = this.langService.getConfigOptionName(
            ServerConfigName.format,
            FormatOption.twentyFour
        );

        let formatInput = args[0].toLowerCase();
        if (![twelveOption, twentyFourOption].includes(formatInput)) {
            await this.msgSender.send(channel, MessageName.configFormatInvalidValue);
            return;
        }

        // TODO: Better way to resolve options
        let option = '12';
        if (formatInput === twentyFourOption) {
            option = '24';
        }

        // TODO: Implement
        await this.guildRepo.setTimeFormat(guild.id, option);

        await this.msgSender.send(channel, MessageName.configFormatSuccess, [
            {
                name: '{FORMAT}',
                value: formatInput,
            },
        ]);
    }

    // TODO: Extract out
    private async processConfigMode(
        channel: TextChannel | DMChannel,
        guild: Guild,
        args: string[]
    ): Promise<void> {
        if (args.length === 0) {
            await this.msgSender.send(channel, MessageName.configModeInvalidValue);
            return;
        }

        let reactOption = this.langService.getConfigOptionName(
            ServerConfigName.mode,
            ModeOption.react
        );
        let listOption = this.langService.getConfigOptionName(
            ServerConfigName.mode,
            ModeOption.list
        );

        let modeInput = args[0].toLowerCase();
        if (![reactOption, listOption].includes(modeInput)) {
            await this.msgSender.send(channel, MessageName.configModeInvalidValue);
            return;
        }

        // TODO: Better way to resolve options
        let option = 'React';
        if (modeInput === listOption) {
            option = 'List';
        }

        await this.guildRepo.setMode(guild.id, option);

        await this.msgSender.send(channel, MessageName.configModeSuccess, [
            {
                name: '{MODE}',
                value: modeInput,
            },
        ]);
    }
}
