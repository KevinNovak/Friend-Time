import { LangCode } from '.';
import { Lang } from '../../services';
import { Display, Keyword } from '../common';

export enum TimeFormatOption {
    TWELVE_HOUR = 'TWELVE_HOUR',
    TWENTY_FOUR_HOUR = 'TWENTY_FOUR_HOUR',
}

interface TimeFormatData extends Keyword, Display {
    format: string;
}

export class TimeFormat {
    public static Data: {
        [key in TimeFormatOption]: TimeFormatData;
    } = {
        TWELVE_HOUR: {
            keyword(langCode: LangCode): string {
                return Lang.getRef('timeFormat.twelveHour', langCode);
            },
            regex(langCode: LangCode): RegExp {
                return Lang.getRegex('timeFormat.twelveHour', langCode);
            },
            displayName(langCode: LangCode): string {
                return Lang.getRef('timeFormat.twelveHourDisplay', langCode);
            },
            format: 'h:mm a',
        },
        TWENTY_FOUR_HOUR: {
            keyword(langCode: LangCode): string {
                return Lang.getRef('timeFormat.twentyFourHour', langCode);
            },
            regex(langCode: LangCode): RegExp {
                return Lang.getRegex('timeFormat.twentyFourHour', langCode);
            },
            displayName(langCode: LangCode): string {
                return Lang.getRef('timeFormat.twentyFourHourDisplay', langCode);
            },
            format: 'HH:mm',
        },
    };

    public static find(input: string, langCode: LangCode): TimeFormatOption {
        for (let [option, data] of Object.entries(this.Data)) {
            if (data.regex(langCode).test(input)) {
                return TimeFormatOption[option];
            }
        }
    }
}
