import { DMChannel, Guild, Message, TextChannel } from 'discord.js';

import {
    FormatOption,
    ModeOption,
    NotifyOption,
    ServerConfigName,
} from '../models/server-config-models';
import { GuildRepo } from '../repos';
import { MessageSender } from '../services';
import { PermissionUtils } from '../utils';
import { Command } from './command';

// TODO: This whole class needs refactored with the config options
export class ConfigCommand implements Command {
    public name = 'config';
    public requireGuild = true;

    constructor(private msgSender: MessageSender, private guildRepo: GuildRepo) {}

    public async execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel
    ): Promise<void> {
        if (args.length === 0) {
            await this.msgSender.sendEmbed(channel, 'config');
            return;
        }

        if (!PermissionUtils.isAdmin(msg.author, channel as TextChannel)) {
            await this.msgSender.sendEmbed(channel, 'notAdmin');
            return;
        }

        let subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case ServerConfigName.mode: {
                this.processConfigMode(channel, msg.guild, args.slice(1));
                return;
            }
            case ServerConfigName.format: {
                this.processConfigFormat(channel, msg.guild, args.slice(1));
                return;
            }
            case ServerConfigName.notify: {
                this.processConfigNotify(channel, msg.guild, args.slice(1));
                return;
            }
            default: {
                await this.msgSender.sendEmbed(channel, 'configNotFound');
                return;
            }
        }
    }

    // TODO: Extract out
    private async processConfigNotify(
        channel: TextChannel | DMChannel,
        guild: Guild,
        args: string[]
    ): Promise<void> {
        if (args.length === 0) {
            await this.msgSender.sendEmbed(channel, 'configNotifyInvalidValue');
            return;
        }

        let input = args[0].toLowerCase();
        if (![NotifyOption.on.toString(), NotifyOption.off.toString()].includes(input)) {
            await this.msgSender.sendEmbed(channel, 'configNotifyInvalidValue');
            return;
        }

        let option = true;
        if (input === NotifyOption.off) {
            option = false;
        }

        await this.guildRepo.setNotify(guild.id, option);

        await this.msgSender.sendEmbed(channel, 'configNotifySuccess', {
            NOTIFY: input,
        });
    }

    // TODO: Extract out
    private async processConfigFormat(
        channel: TextChannel | DMChannel,
        guild: Guild,
        args: string[]
    ): Promise<void> {
        if (args.length === 0) {
            await this.msgSender.sendEmbed(channel, 'configFormatInvalidValue');
            return;
        }

        let input = args[0].toLowerCase();
        if (![FormatOption.twelve.toString(), FormatOption.twentyFour.toString()].includes(input)) {
            await this.msgSender.sendEmbed(channel, 'configFormatInvalidValue');
            return;
        }

        let option = '12';
        if (input === FormatOption.twentyFour) {
            option = '24';
        }

        await this.guildRepo.setTimeFormat(guild.id, option);

        await this.msgSender.sendEmbed(channel, 'configFormatSuccess', {
            FORMAT: input,
        });
    }

    // TODO: Extract out
    private async processConfigMode(
        channel: TextChannel | DMChannel,
        guild: Guild,
        args: string[]
    ): Promise<void> {
        if (args.length === 0) {
            await this.msgSender.sendEmbed(channel, 'configModeInvalidValue');
            return;
        }

        let input = args[0].toLowerCase();
        if (![ModeOption.react.toString(), ModeOption.list.toString()].includes(input)) {
            await this.msgSender.sendEmbed(channel, 'configModeInvalidValue');
            return;
        }

        let option = 'React';
        if (input === ModeOption.list) {
            option = 'List';
        }

        await this.guildRepo.setMode(guild.id, option);

        await this.msgSender.sendEmbed(channel, 'configModeSuccess', { MODE: input });
    }
}
