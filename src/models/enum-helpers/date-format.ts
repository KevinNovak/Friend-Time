import { Locale } from 'discord.js';

import { DateFormatOption } from '../../enums/index.js';
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
            displayName(langCode: Locale): string {
                return Lang.getRef('dateFormat.monthDay', langCode);
            },
            littleEndian: false,
        },
        DAY_MONTH: {
            name(): string {
                return Lang.getCom('dateFormat.dayMonth');
            },
            displayName(langCode: Locale): string {
                return Lang.getRef('dateFormat.dayMonth', langCode);
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
