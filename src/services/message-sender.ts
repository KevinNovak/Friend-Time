import { DMChannel, MessageEmbed, TextChannel } from 'discord.js';
import { Logs } from '../models/internal-language';
import { StringUtils } from '../utils/string-utils';
import { LangCode } from './language/lang-code';
import { LanguageService } from './language/lang-service';
import { MessageName } from './language/message-name';
import { Logger } from './logger';
import { MessageBuilder } from './message-builder';

export class MessageSender {
    constructor(
        private msgBuilder: MessageBuilder,
        private langService: LanguageService,
        private logger: Logger,
        private logs: Logs
    ) {}

    public async send(
        channel: TextChannel | DMChannel,
        lang: LangCode = LangCode.en,
        messageName: MessageName,
        variables?: { name: string; value: string }[],
        backupChannel?: TextChannel | DMChannel
    ): Promise<void> {
        let message = this.langService.getMessage(messageName, lang);
        if (variables) {
            message = StringUtils.replaceVariables(message, variables);
        }
        let embed = this.msgBuilder.createEmbed(message);
        this.trySend(channel, embed, backupChannel);
    }

    public async sendWithTitle(
        channel: TextChannel | DMChannel,
        lang: LangCode = LangCode.en,
        messageName: MessageName,
        titleName: MessageName,
        variables?: { name: string; value: string }[],
        backupChannel?: TextChannel | DMChannel
    ): Promise<void> {
        let message = this.langService.getMessage(messageName, lang);
        if (variables) {
            message = StringUtils.replaceVariables(message, variables);
        }
        let title = this.langService.getMessage(titleName, lang);
        let embed = this.msgBuilder.createEmbed(message, title);
        this.trySend(channel, embed, backupChannel);
    }

    private async trySend(
        channel: TextChannel | DMChannel,
        embed: MessageEmbed,
        backupChannel?: TextChannel | DMChannel
    ): Promise<void> {
        try {
            await channel.send(embed);
        } catch (error) {
            // 50007: "Cannot send messages to this user"
            if (error.code === 50007 && backupChannel) {
                let embed = this.msgBuilder.createEmbed(
                    // TODO: Message
                    `I'm unable to direct message you. Please make sure you have direct messages from this server enabled.`
                );
                try {
                    await backupChannel.send(embed);
                } catch (error) {
                    // TODO: Log
                    console.log('CRITICAL ERROR');
                }
                return;
            }

            this.logger.error(this.logs.sendMessageError, error);
        }
    }
}
