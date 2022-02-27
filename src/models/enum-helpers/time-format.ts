import { LangCode, TimeFormatOption } from '../../enums/index.js';
import { Lang } from '../../services/index.js';
import { Display } from '../common/index.js';

interface TimeFormatData extends Display {
    name(): string;
    format: string;
}

export class TimeFormat {
    public static Data: {
        [key in TimeFormatOption]: TimeFormatData;
    } = {
        TWELVE_HOUR: {
            name(): string {
                return Lang.getCom('timeFormat.twelveHour');
            },
            displayName(langCode: LangCode): string {
                return Lang.getRef('timeFormat.twelveHourDisplay', langCode);
            },
            format: 'h:mm a',
        },
        TWENTY_FOUR_HOUR: {
            name(): string {
                return Lang.getCom('timeFormat.twentyFourHour');
            },
            displayName(langCode: LangCode): string {
                return Lang.getRef('timeFormat.twentyFourHourDisplay', langCode);
            },
            format: 'HH:mm',
        },
    };

    public static find(input: string): TimeFormatOption {
        for (let [option, data] of Object.entries(this.Data)) {
            if (data.name().toLowerCase() === input.toLowerCase()) {
                return TimeFormatOption[option];
            }
        }
    }
}
