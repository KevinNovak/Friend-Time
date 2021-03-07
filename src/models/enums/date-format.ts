import { LangCode } from '.';
import { Lang } from '../../services';
import { Display, Keyword } from '../common';

export enum DateFormatOption {
    MONTH_DAY = 'MONTH_DAY',
    DAY_MONTH = 'DAY_MONTH',
}

interface DateFormatData extends Keyword, Display {
    littleEndian: boolean;
}

export class DateFormat {
    public static Data: {
        [key in DateFormatOption]: DateFormatData;
    } = {
        MONTH_DAY: {
            keyword(langCode: LangCode): string {
                return Lang.getRef('dateFormat.monthDay', langCode);
            },
            regex(langCode: LangCode): RegExp {
                return Lang.getRegex('dateFormat.monthDay', langCode);
            },
            displayName(langCode: LangCode): string {
                return Lang.getRef('dateFormat.monthDayDisplay', langCode);
            },
            littleEndian: false,
        },
        DAY_MONTH: {
            keyword(langCode: LangCode): string {
                return Lang.getRef('dateFormat.dayMonth', langCode);
            },
            regex(langCode: LangCode): RegExp {
                return Lang.getRegex('dateFormat.dayMonth', langCode);
            },
            displayName(langCode: LangCode): string {
                return Lang.getRef('dateFormat.dayMonthDisplay', langCode);
            },
            littleEndian: true,
        },
    };

    public static find(input: string, langCode: LangCode): DateFormatOption {
        for (let [option, data] of Object.entries(this.Data)) {
            if (data.regex(langCode).test(input)) {
                return DateFormatOption[option];
            }
        }
    }
}
