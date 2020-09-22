import { MessageEmbed } from 'discord.js';
import { MultilingualService } from 'discord.js-multilingual-utils';

import { Language } from '../../models/language';
import { LangCode } from './lang-code';
import { MessageName } from './message-name';
import { ServerConfigName } from './server-config';

export class LanguageService {
    constructor(private multilingualService: MultilingualService, private languages: Language[]) {}

    public getEmbed(embedName: string, variables?: { [name: string]: string }): MessageEmbed {
        return this.multilingualService.getEmbed(embedName, 'en', variables);
    }

    public getMessage(messageName: MessageName): string {
        let message = this.findLang(LangCode.en).messages[messageName];
        if (Array.isArray(message)) {
            return message.join('\n');
        }
        return message;
    }

    public getConfigName(configName: ServerConfigName): string {
        return this.findLang(LangCode.en).serverConfig[configName].name;
    }

    public getConfigOptionName(configName: ServerConfigName, option: string): string {
        return this.findLang(LangCode.en).serverConfig[configName].options[option];
    }

    private findLang(langCode: LangCode): Language {
        return this.languages.find(lang => lang.langCode === langCode);
    }
}
