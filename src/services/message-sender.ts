import { DMChannel, TextChannel } from 'discord.js';

import { MessageUtils, StringUtils } from '../utils';
import { LanguageService } from './language/lang-service';
import { MessageName } from './language/message-name';
import { MessageBuilder } from './message-builder';

export class MessageSender {
    constructor(private msgBuilder: MessageBuilder, private langService: LanguageService) {}

    public async sendEmbed(
        channel: TextChannel | DMChannel,
        embedName: string,
        variables?: { [name: string]: string }
    ): Promise<void> {
        let embed = this.langService.getEmbed(embedName, variables);
        await MessageUtils.send(channel, embed);
    }

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
        await MessageUtils.send(channel, embed);
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
        await MessageUtils.send(channel, embed);
    }
}
