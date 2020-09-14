import { DMChannel, MessageEmbed, TextChannel } from 'discord.js';

import { Logs } from '../models/internal-language';
import { StringUtils } from '../utils';
import { LanguageService } from './language/lang-service';
import { MessageName } from './language/message-name';
import { Logger } from './logger';
import { MessageBuilder } from './message-builder';

export class MessageSender {
    constructor(
        private msgBuilder: MessageBuilder,
        private langService: LanguageService,
        private logs: Logs
    ) {}

    public async send(
        channel: TextChannel | DMChannel,
        messageName: MessageName,
        variables?: { name: string; value: string }[]
    ): Promise<void> {
        let message = this.langService.getMessage(messageName);
        if (variables) {
            message = StringUtils.replaceVariables(message, variables);
        }
        let embed = this.msgBuilder.createEmbed(message);
        await this.trySend(channel, embed);
    }

    public async sendWithTitle(
        channel: TextChannel | DMChannel,
        messageName: MessageName,
        titleName: MessageName,
        variables?: { name: string; value: string }[]
    ): Promise<void> {
        let message = this.langService.getMessage(messageName);
        if (variables) {
            message = StringUtils.replaceVariables(message, variables);
        }
        let title = this.langService.getMessage(titleName);
        let embed = this.msgBuilder.createEmbed(message, title);
        await this.trySend(channel, embed);
    }

    private async trySend(channel: TextChannel | DMChannel, embed: MessageEmbed): Promise<void> {
        try {
            await channel.send(embed);
        } catch (error) {
            // Ignore 50007: "Cannot send messages to this user"
            if (error.code === 50007) {
                return;
            }

            Logger.error(this.logs.sendMessageError, error);
        }
    }
}
