import { LangCode } from '.';
import { Lang } from '../../services';
import { Display } from '../common';

interface YesNoData extends Display {
    name(): string;
    value: boolean;
}

export class YesNo {
    public static Data: {
        [key: string]: YesNoData;
    } = {
        true: {
            name(): string {
                return Lang.getCom('yesNo.yes');
            },
            displayName(langCode: LangCode): string {
                return Lang.getRef('yesNo.yesDisplay', langCode);
            },
            value: true,
        },
        false: {
            name(): string {
                return Lang.getCom('yesNo.no');
            },
            displayName(langCode: LangCode): string {
                return Lang.getRef('yesNo.noDisplay', langCode);
            },
            value: false,
        },
    };

    public static find(input: string): boolean {
        for (let [_, data] of Object.entries(this.Data)) {
            if (data.name().toLowerCase() === input.toLowerCase()) {
                return data.value;
            }
        }
    }
}
