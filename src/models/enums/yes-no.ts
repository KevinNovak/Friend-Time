import { LangCode } from '.';
import { Lang } from '../../services';
import { Display, Keyword } from '../common';

interface YesNoData extends Keyword, Display {
    value: boolean;
}

export class YesNo {
    public static Data: {
        [key: string]: YesNoData;
    } = {
        true: {
            keyword(langCode: LangCode): string {
                return Lang.getRef('yesNo.yes', langCode);
            },
            regex(langCode: LangCode): RegExp {
                return Lang.getRegex('yesNoRegexes.yes', langCode);
            },
            displayName(langCode: LangCode): string {
                return Lang.getRef('yesNo.yesDisplay', langCode);
            },
            value: true,
        },
        false: {
            keyword(langCode: LangCode): string {
                return Lang.getRef('yesNo.no', langCode);
            },
            regex(langCode: LangCode): RegExp {
                return Lang.getRegex('yesNoRegexes.no', langCode);
            },
            displayName(langCode: LangCode): string {
                return Lang.getRef('yesNo.noDisplay', langCode);
            },
            value: false,
        },
    };

    public static find(input: string, langCode: LangCode): boolean {
        for (let [_, data] of Object.entries(this.Data)) {
            if (data.regex(langCode).test(input)) {
                return data.value;
            }
        }
    }
}
