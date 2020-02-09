import { DMChannel, Guild, Message, TextChannel } from 'discord.js';
import { ServerData } from '../models/server-data';
import { UserData } from '../models/user-data';
import { ServerRepo } from '../services/database/server-repo';
import { CommandName } from '../services/language/command-name';
import { LangCode } from '../services/language/lang-code';
import { LanguageService } from '../services/language/lang-service';
import { MessageName } from '../services/language/message-name';
import { FormatOption } from '../services/language/server-config/format-option';
import { ModeOption } from '../services/language/server-config/mode-option';
import { NotifyOption } from '../services/language/server-config/notify-option';
import { ServerConfigName } from '../services/language/server-config/server-config-name';
import { MessageSender } from '../services/message-sender';
import { ServerUtils } from '../utils/server-utils';
import { UserUtils } from '../utils/user-utils';
import { Command } from './command';

// TODO: This whole class needs refactored with the config options
export class ConfigCommand implements Command {
    public name = CommandName.config;

    constructor(
        private msgSender: MessageSender,
        private serverRepo: ServerRepo,
        private langService: LanguageService
    ) {}

    public async execute(
        msg: Message,
        args: string[],
        authorData: UserData,
        serverData?: ServerData
    ): Promise<void> {
        let author = msg.author;
        let channel = msg.channel;
        let server = msg.guild;

        if (!ServerUtils.isTextChannel(channel)) {
            this.msgSender.send(channel, authorData.LangCode, MessageName.serverOnly);
            return;
        }

        if (args.length === 0) {
            this.msgSender.sendWithTitle(
                channel,
                authorData.LangCode,
                MessageName.configMessage,
                MessageName.configTitle
            );
            return;
        }

        if (!UserUtils.isAdmin(author, channel as TextChannel)) {
            this.msgSender.send(channel, authorData.LangCode, MessageName.notAdmin);
            return;
        }

        let subCommand = args[0].toLowerCase();
        let modeConfigName = this.langService.getConfigName(
            ServerConfigName.mode,
            authorData.LangCode
        );
        let formatConfigName = this.langService.getConfigName(
            ServerConfigName.format,
            authorData.LangCode
        );
        let notifyConfigName = this.langService.getConfigName(
            ServerConfigName.notify,
            authorData.LangCode
        );

        if (![modeConfigName, formatConfigName, notifyConfigName].includes(subCommand)) {
            this.msgSender.send(channel, authorData.LangCode, MessageName.configNotFound);
            return;
        }

        if (subCommand === modeConfigName) {
            this.processConfigMode(channel, server, args.slice(1), authorData.LangCode);
            return;
        }

        if (subCommand === formatConfigName) {
            this.processConfigFormat(channel, server, args.slice(1), authorData.LangCode);
            return;
        }

        if (subCommand === notifyConfigName) {
            this.processConfigNotify(channel, server, args.slice(1), authorData.LangCode);
            return;
        }
    }

    // TODO: Extract out
    private processConfigNotify(
        channel: TextChannel | DMChannel,
        server: Guild,
        args: string[],
        langCode: LangCode
    ) {
        if (args.length === 0) {
            this.msgSender.send(channel, langCode, MessageName.configNotifyInvalidValue);
            return;
        }

        let onOption = this.langService.getConfigOptionName(
            ServerConfigName.notify,
            NotifyOption.on,
            langCode
        );
        let offOption = this.langService.getConfigOptionName(
            ServerConfigName.notify,
            NotifyOption.off,
            langCode
        );

        let notifyInput = args[0].toLowerCase();
        if (![onOption, offOption].includes(notifyInput)) {
            this.msgSender.send(channel, langCode, MessageName.configNotifyInvalidValue);
            return;
        }

        // TODO: Better way to resolve options
        let option = true;
        if (notifyInput === offOption) {
            option = false;
        }

        this.serverRepo.setNotify(server.id, option);

        this.msgSender.send(channel, langCode, MessageName.configNotifySuccess, [
            {
                name: '{NOTIFY}',
                value: notifyInput,
            },
        ]);
    }

    // TODO: Extract out
    private processConfigFormat(
        channel: TextChannel | DMChannel,
        server: Guild,
        args: string[],
        langCode: LangCode
    ) {
        if (args.length === 0) {
            this.msgSender.send(channel, langCode, MessageName.configFormatInvalidValue);
            return;
        }

        let twelveOption = this.langService.getConfigOptionName(
            ServerConfigName.format,
            FormatOption.twelve,
            langCode
        );
        let twentyFourOption = this.langService.getConfigOptionName(
            ServerConfigName.format,
            FormatOption.twentyFour,
            langCode
        );

        let formatInput = args[0].toLowerCase();
        if (![twelveOption, twentyFourOption].includes(formatInput)) {
            this.msgSender.send(channel, langCode, MessageName.configFormatInvalidValue);
            return;
        }

        // TODO: Better way to resolve options
        let option = '12';
        if (formatInput === twentyFourOption) {
            option = '24';
        }

        // TODO: Implement
        this.serverRepo.setTimeFormat(server.id, option);

        this.msgSender.send(channel, langCode, MessageName.configFormatSuccess, [
            {
                name: '{FORMAT}',
                value: formatInput,
            },
        ]);
    }

    // TODO: Extract out
    private processConfigMode(
        channel: TextChannel | DMChannel,
        server: Guild,
        args: string[],
        langCode: LangCode
    ) {
        if (args.length === 0) {
            this.msgSender.send(channel, langCode, MessageName.configModeInvalidValue);
            return;
        }

        let reactOption = this.langService.getConfigOptionName(
            ServerConfigName.mode,
            ModeOption.react,
            langCode
        );
        let listOption = this.langService.getConfigOptionName(
            ServerConfigName.mode,
            ModeOption.list,
            langCode
        );

        let modeInput = args[0].toLowerCase();
        if (![reactOption, listOption].includes(modeInput)) {
            this.msgSender.send(channel, langCode, MessageName.configModeInvalidValue);
            return;
        }

        // TODO: Better way to resolve options
        let option = 'React';
        if (modeInput === listOption) {
            option = 'List';
        }

        this.serverRepo.setMode(server.id, option);

        this.msgSender.send(channel, langCode, MessageName.configModeSuccess, [
            {
                name: '{MODE}',
                value: modeInput,
            },
        ]);
    }
}
