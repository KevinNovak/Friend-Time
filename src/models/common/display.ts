import { Locale } from 'discord-api-types/v10';

export interface Display {
    displayName(langCode: Locale): string;
}
