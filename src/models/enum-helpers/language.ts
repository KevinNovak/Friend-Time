import { Locale } from '../../enums/index.js';
import { Lang } from '../../services/index.js';

export class Language {
    public static keyword(langCode: Locale): string {
        return Lang.getRef('meta.language', langCode);
    }

    public static regex(langCode: Locale): RegExp {
        return Lang.getRegex('metaRegexes.language', langCode);
    }

    public static displayName(langCode: Locale): string {
        return Lang.getRef('meta.languageDisplay', langCode);
    }

    public static locale(langCode: Locale): string {
        return Lang.getRef('meta.locale', langCode);
    }

    public static translators(langCode: Locale): string {
        return Lang.getRef('meta.translators', langCode);
    }

    public static find(input: string): Locale {
        for (let langCode of Object.values(Locale)) {
            if (this.regex(langCode).test(input)) {
                return langCode;
            }
        }
    }

    public static list(): string {
        return Object.values(Locale)
            .map(langCode => {
                return Lang.getRef('lists.languageItem', langCode, {
                    LANGUAGE_NAME: this.displayName(langCode),
                    LANGUAGE_KEYWORD: this.keyword(langCode),
                });
            })
            .join('\n')
            .trim();
    }
}
