import { Commands, Language } from '../../models/language';
import { LangCode } from './lang-code';
import { MessageName } from './message-name';
import { ServerConfigName } from './server-config/server-config-name';

export class LanguageService {
    constructor(private languages: Language[]) {}

    public getCommands(langCode: LangCode = LangCode.en): Commands {
        return this.findLang(langCode).commands;
    }

    public getMessage(messageName: MessageName, langCode: LangCode = LangCode.en): string {
        let message = this.findLang(langCode).messages[messageName];
        if (Array.isArray(message)) {
            return message.join('\n');
        }
        return message;
    }

    public getConfigName(configName: ServerConfigName, langCode: LangCode = LangCode.en): string {
        return this.findLang(langCode).serverConfig[configName].name;
    }

    public getConfigOptionName(
        configName: ServerConfigName,
        option: string,
        langCode: LangCode = LangCode.en
    ): string {
        return this.findLang(langCode).serverConfig[configName].options[option];
    }

    private findLang(langCode: LangCode): Language {
        return this.languages.find(lang => lang.langCode === langCode);
    }
}
