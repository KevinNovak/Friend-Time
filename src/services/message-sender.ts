import { DMChannel, TextChannel } from 'discord.js';

import { MessageUtils } from '../utils';
import { LanguageService } from './language/lang-service';

export class MessageSender {
    constructor(private langService: LanguageService) {}

    public async send(
        channel: TextChannel | DMChannel,
        messageName: string,
        variables?: { [name: string]: string }
    ): Promise<void> {
        let message = this.langService.getEmbed(messageName, variables).description;
        await MessageUtils.send(channel, message);
    }

    public async sendEmbed(
        channel: TextChannel | DMChannel,
        embedName: string,
        variables?: { [name: string]: string }
    ): Promise<void> {
        let embed = this.langService.getEmbed(embedName, variables);
        await MessageUtils.send(channel, embed);
    }
}
