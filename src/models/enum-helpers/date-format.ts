import { DateFormatOption, LangCode } from '../../enums/index.js';
import { Lang } from '../../services/index.js';
import { Display } from '../common/index.js';

interface DateFormatData extends Display {
    name(): string;
    littleEndian: boolean;
}

export class DateFormat {
    public static Data: {
        [key in DateFormatOption]: DateFormatData;
    } = {
        MONTH_DAY: {
            name(): string {
                return Lang.getCom('dateFormat.monthDay');
            },
            displayName(langCode: LangCode): string {
                return Lang.getRef('dateFormat.monthDayDisplay', langCode);
            },
            littleEndian: false,
        },
        DAY_MONTH: {
            name(): string {
                return Lang.getCom('dateFormat.dayMonth');
            },
            displayName(langCode: LangCode): string {
                return Lang.getRef('dateFormat.dayMonthDisplay', langCode);
            },
            littleEndian: true,
        },
    };

    public static find(input: string): DateFormatOption {
        for (let [option, data] of Object.entries(this.Data)) {
            if (data.name().toLowerCase() === input.toLowerCase()) {
                return DateFormatOption[option];
            }
        }
    }
}
