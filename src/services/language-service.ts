import { MessageEmbed } from 'discord.js';
import { MultilingualService } from 'discord.js-multilingual-utils';

export class LanguageService {
    constructor(private multilingualService: MultilingualService) {}

    public getEmbed(embedName: string, variables?: { [name: string]: string }): MessageEmbed {
        return this.multilingualService.getEmbed(embedName, 'en', variables);
    }
}
