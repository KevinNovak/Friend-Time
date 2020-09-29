import { DMChannel, TextChannel } from 'discord.js';

import { MessageUtils } from '../utils';
import { LanguageService } from './language/lang-service';

export class MessageSender {
    constructor(private langService: LanguageService) {}

    public async sendEmbed(
        channel: TextChannel | DMChannel,
        embedName: string,
        variables?: { [name: string]: string }
    ): Promise<void> {
        let embed = this.langService.getEmbed(embedName, variables);
        await MessageUtils.send(channel, embed);
    }
}
