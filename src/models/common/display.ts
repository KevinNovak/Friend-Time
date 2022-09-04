import { Locale } from '../../enums/index.js';

export interface Display {
    displayName(langCode: Locale): string;
}
